import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MarketplaceAnchor } from "../target/types/marketplace_anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { expect } from "chai";

describe("marketplace-anchor", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MarketplaceAnchor as Program<MarketplaceAnchor>;
  
  let marketplacePda: PublicKey;
  let marketplaceBump: number;
  let gameAuthority: Keypair;
  let gamePda: PublicKey;
  let gameBump: number;
  let nftMint: PublicKey;
  let seller: Keypair;
  let buyer: Keypair;
  
  before(async () => {
    // Инициализация ключей
    gameAuthority = Keypair.generate();
    seller = Keypair.generate();
    buyer = Keypair.generate();
    
    // Пополнение аккаунтов
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(gameAuthority.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(seller.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(buyer.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    
    // Найти PDA для маркетплейса
    [marketplacePda, marketplaceBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace")],
      program.programId
    );
    
    // Найти PDA для игры
    [gamePda, gameBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameAuthority.publicKey.toBuffer()],
      program.programId
    );
    
    // Создать NFT токен
    nftMint = await createMint(
      provider.connection,
      seller,
      seller.publicKey,
      null,
      0 // NFT имеет 0 десятичных знаков
    );
  });

  it("Инициализирует маркетплейс", async () => {
    const tx = await program.methods
      .initializeMarketplace(250) // 2.5% комиссия
      .accounts({
        marketplace: marketplacePda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Маркетплейс инициализирован:", tx);
    
    const marketplaceAccount = await program.account.marketplace.fetch(marketplacePda);
    expect(marketplaceAccount.feeBasisPoints).to.equal(250);
    expect(marketplaceAccount.totalVolume.toNumber()).to.equal(0);
  });

  it("Регистрирует новую игру", async () => {
    const gameName = "Epic RPG";
    const gameSymbol = "ERPG";
    const gameDescription = "An epic role-playing game with amazing items";
    
    const tx = await program.methods
      .registerGame(gameName, gameSymbol, gameDescription)
      .accounts({
        game: gamePda,
        authority: gameAuthority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([gameAuthority])
      .rpc();

    console.log("Игра зарегистрирована:", tx);
    
    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.name).to.equal(gameName);
    expect(gameAccount.symbol).to.equal(gameSymbol);
    expect(gameAccount.verified).to.be.false;
  });

  it("Создает листинг NFT", async () => {
    // Создать аккаунт токена для продавца и минтнуть NFT
    const sellerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      seller,
      nftMint,
      seller.publicKey
    );
    
    await mintTo(
      provider.connection,
      seller,
      nftMint,
      sellerTokenAccount,
      seller.publicKey,
      1 // Минтим 1 NFT
    );
    
    // Найти PDA для листинга
    const [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), nftMint.toBuffer()],
      program.programId
    );
    
    const price = new anchor.BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL
    
    const tx = await program.methods
      .createListing(price)
      .accounts({
        listing: listingPda,
        seller: seller.publicKey,
        nftMint: nftMint,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([seller])
      .rpc();

    console.log("Листинг создан:", tx);
    
    const listingAccount = await program.account.listing.fetch(listingPda);
    expect(listingAccount.price.toNumber()).to.equal(price.toNumber());
    expect(listingAccount.isActive).to.be.true;
  });

  it("Покупает NFT", async () => {
    // Создать аккаунты токенов
    const sellerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      seller,
      nftMint,
      seller.publicKey
    );
    
    const buyerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      buyer,
      nftMint,
      buyer.publicKey
    );
    
    const [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), nftMint.toBuffer()],
      program.programId
    );
    
    const tx = await program.methods
      .buyNft()
      .accounts({
        listing: listingPda,
        marketplace: marketplacePda,
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        marketplaceAuthority: provider.wallet.publicKey,
        sellerTokenAccount: sellerTokenAccount,
        buyerTokenAccount: buyerTokenAccount,
        nftMint: nftMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    console.log("NFT куплен:", tx);
    
    const listingAccount = await program.account.listing.fetch(listingPda);
    expect(listingAccount.isActive).to.be.false;
    
    const marketplaceAccount = await program.account.marketplace.fetch(marketplacePda);
    expect(marketplaceAccount.totalSales.toNumber()).to.equal(1);
  });
});
