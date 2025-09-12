use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("5k9vS19CiM5ekXKiPwUjMR4geAonUCgnMgfbY3vfFVaH");

#[program]
pub mod marketplace_anchor {
    use super::*;

    // Инициализация маркетплейса
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        fee_basis_points: u16,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.fee_basis_points = fee_basis_points;
        marketplace.total_volume = 0;
        marketplace.total_sales = 0;
        
        msg!("Marketplace initialized with fee: {} basis points", fee_basis_points);
        Ok(())
    }

    // Регистрация игры
    pub fn register_game(
        ctx: Context<RegisterGame>,
        name: String,
        symbol: String,
        description: String,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.authority = ctx.accounts.authority.key();
        game.name = name;
        game.symbol = symbol;
        game.description = description;
        game.total_items = 0;
        game.verified = false;
        
        msg!("Game registered: {}", game.name);
        Ok(())
    }

    // Создание листинга NFT
    pub fn create_listing(
        ctx: Context<CreateListing>,
        price: u64,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.nft_mint = ctx.accounts.nft_mint.key();
        listing.price = price;
        listing.is_active = true;
        listing.created_at = Clock::get()?.unix_timestamp;
        
        msg!("NFT listed for sale: {} SOL", price);
        Ok(())
    }

    // Покупка NFT
    pub fn buy_nft(ctx: Context<BuyNft>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let marketplace = &mut ctx.accounts.marketplace;
        
        require!(listing.is_active, ErrorCode::ListingNotActive);
        
        let price = listing.price;
        let fee = (price * marketplace.fee_basis_points as u64) / 10000;
        let seller_amount = price - fee;

        // Перевод SOL продавцу
        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? -= price;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += seller_amount;
        **ctx.accounts.marketplace_authority.to_account_info().try_borrow_mut_lamports()? += fee;

        // Перевод NFT покупателю
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.seller_token_account.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            1,
        )?;

        listing.is_active = false;
        marketplace.total_volume += price;
        marketplace.total_sales += 1;

        msg!("NFT sold for {} SOL", price);
        Ok(())
    }
}

// Аккаунт маркетплейса
#[account]
pub struct Marketplace {
    pub authority: Pubkey,           // Владелец маркетплейса
    pub fee_basis_points: u16,       // Комиссия в базисных пунктах (100 = 1%)
    pub total_volume: u64,           // Общий объем торгов
    pub total_sales: u64,            // Количество продаж
}

// Аккаунт игры
#[account]
pub struct Game {
    pub authority: Pubkey,           // Разработчик игры
    pub name: String,                // Название игры
    pub symbol: String,              // Символ токенов
    pub description: String,         // Описание
    pub total_items: u64,           // Количество созданных предметов
    pub verified: bool,              // Верификация игры
}

// Аккаунт листинга
#[account]
pub struct Listing {
    pub seller: Pubkey,              // Продавец
    pub nft_mint: Pubkey,           // Адрес NFT токена
    pub price: u64,                  // Цена в лампортах
    pub is_active: bool,             // Активен ли листинг
    pub created_at: i64,            // Время создания
}

// Контексты для инструкций
#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 2 + 8 + 8,
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterGame<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + name.len() + 4 + 10 + 4 + 200 + 8 + 1,
        seeds = [b"game", authority.key().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = seller,
        space = 8 + 32 + 32 + 8 + 1 + 8,
        seeds = [b"listing", nft_mint.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub nft_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyNft<'info> {
    #[account(mut)]
    pub listing: Account<'info, Listing>,
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Safe as we only transfer lamports
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    /// CHECK: Safe as we only transfer lamports
    #[account(mut)]
    pub marketplace_authority: AccountInfo<'info>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = nft_mint,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    pub nft_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// Коды ошибок
#[error_code]
pub enum ErrorCode {
    #[msg("Listing is not active")]
    ListingNotActive,
}
