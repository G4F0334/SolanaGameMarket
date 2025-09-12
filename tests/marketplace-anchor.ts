import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddressSync,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";
import { MarketplaceAnchor } from "../target/types/marketplace_anchor";
import { createAssociatedTokenAccount } from "@solana/spl-token";

describe("marketplace-anchor", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.MarketplaceAnchor as Program<MarketplaceAnchor>;
  const wallet = provider.wallet as anchor.Wallet;

  let marketplacePda: PublicKey;
  let gamePda: PublicKey;
  let nftMint: PublicKey;
  let seller: Keypair;
  let buyer: Keypair;

  before(async () => {
    seller = Keypair.generate();
    buyer = Keypair.generate();

    // Немного SOL продавцу и покупателю
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(seller.publicKey, 2e9)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(buyer.publicKey, 2e9)
    );

    // PDA маркетплейса
    [marketplacePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace")],
      program.programId
    );

    // PDA игры
    [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), wallet.publicKey.toBuffer()],
      program.programId
    );

    // Создаём NFT mint
    nftMint = await createMint(
      provider.connection,
      wallet.payer,
      seller.publicKey,
      null,
      0
    );
  });

  it("Инициализирует маркетплейс", async () => {
    await program.methods
      .initializeMarketplace(500) // 5%
      .accounts({
        marketplace: marketplacePda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const acc = await program.account.marketplace.fetch(marketplacePda);
    expect(acc.feeBasisPoints).to.equal(500);
  });

  it("Регистрирует новую игру", async () => {
    await program.methods
      .registerGame("MyGame", "MG", "Test game")
      .accounts({
        game: gamePda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const game = await program.account.game.fetch(gamePda);
    expect(game.name).to.equal("MyGame");
  });

  it("Создает листинг NFT", async () => {

    const sellerAta = await createAssociatedTokenAccount(
      provider.connection,
      wallet.payer,        // payer
      nftMint,             // mint
      seller.publicKey     // owner
    );

    // Минтим NFT продавцу
    await mintTo(
      provider.connection,
      wallet.payer,
      nftMint,
      sellerAta,
      seller,
      1
    );

    const [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), nftMint.toBuffer()],
      program.programId
    );

    await program.methods
      .createListing(new anchor.BN(1e9)) // 1 SOL
      .accounts({
        listing: listingPda,
        seller: seller.publicKey,
        nftMint,
        systemProgram: SystemProgram.programId,
      })
      .signers([seller])
      .rpc();

    const listing = await program.account.listing.fetch(listingPda);
    expect(listing.price.toNumber()).to.equal(1e9);
  });

  it("Покупает NFT", async () => {
    const [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), nftMint.toBuffer()],
      program.programId
    );

    const sellerTokenAccount = getAssociatedTokenAddressSync(
      nftMint,
      seller.publicKey
    );
    const buyerTokenAccount = getAssociatedTokenAddressSync(
      nftMint,
      buyer.publicKey
    );

    // Функция-помощник для безопасного получения баланса
    async function safeGetBalance(ata: PublicKey): Promise<number> {
      const acc = await provider.connection.getAccountInfo(ata);
      if (!acc) return 0; // если аккаунта нет, значит баланс 0
      const bal = await provider.connection.getTokenAccountBalance(ata);
      return Number(bal.value.amount);
    }

    let sellerBefore = await safeGetBalance(sellerTokenAccount);
    let buyerBefore = await safeGetBalance(buyerTokenAccount);

    expect(sellerBefore).to.equal(1);
    expect(buyerBefore).to.equal(0);

    console.log("Покупатель покупает NFT...", sellerBefore, "->", buyerBefore);

    await program.methods
      .buyNft()
      .accounts({
        listing: listingPda,
        marketplace: marketplacePda,
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        marketplaceAuthority: wallet.publicKey,
        sellerTokenAccount,
        buyerTokenAccount,
        nftMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer, seller]) // оба подписывают
      .rpc();

    const listingAcc = await program.account.listing.fetch(listingPda);
    expect(listingAcc.isActive).to.be.false;

    const marketplaceAcc = await program.account.marketplace.fetch(marketplacePda);
    expect(marketplaceAcc.totalSales.toNumber()).to.equal(1);

    let sellerAfter = await safeGetBalance(sellerTokenAccount);
    let buyerAfter = await safeGetBalance(buyerTokenAccount);

    console.log("Покупатель покупает NFT...", sellerAfter, "->", buyerAfter);

    expect(sellerAfter).to.equal(0);
    expect(buyerAfter).to.equal(1);
  });
});
