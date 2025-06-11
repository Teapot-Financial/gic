import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Data Definitions (Moved to top for easier access) ---
const accountData = {
    fhsa: {
        title: "FHSA",
        fullName: "First Home Savings Account",
        purpose: "A powerful account to save for a down payment on a first home.",
        annualContributionLimit: 8000,
        lifetimeContributionLimit: 40000,
        details: [
            { title: "Contributions", text: "Tax-deductible, reducing your taxable income for the year. Annual limit of $8,000, lifetime limit of $40,000." },
            { title: "Growth", text: "Grows completely tax-free, like a TFSA." },
            { title: "Withdrawals", text: "Completely tax-free when used for a qualifying first home purchase." },
            { title: "Time Limit", text: "Must be used within 15 years of opening or by age 71. Unused funds can be transferred to an RRSP/RRIF." }
        ],
        features: [
             { title: "Best of Both Worlds", text: "Combines the tax deduction of an RRSP with the tax-free withdrawal of a TFSA for a home purchase." }
        ]
    },
    rrsp: {
        title: "RRSP",
        fullName: "Registered Retirement Savings Plan",
        purpose: "Primarily designed for long-term retirement savings.",
        annualContributionLimit: 31560, // 2024 maximum for charting
        lifetimeContributionLimit: 'Variable (based on unused room)',
        details: [
            { title: "Contributions", text: "Tax-deductible, reducing your taxable income for the year. Based on 18% of prior year's earned income, up to $31,560 (2024)." },
            { title: "Growth", text: "Investments grow tax-deferred until withdrawal." },
            { title: "Withdrawals", "text": "Fully taxable as income when withdrawn, ideally at a lower tax rate in retirement." },
            { title: "Maturity", text: "Must be converted to a RRIF or annuity by the end of the year you turn 71." }
        ],
        features: [
            { title: "Home Buyer's Plan (HBP)", text: "Withdraw up to $35,000 tax-free for a first home, repayable over 15 years." },
            { title: "Lifelong Learning Plan (LLP)", text: "Withdraw up to $20,000 tax-free for education, repayable over 10 years." }
        ]
    },
    tfsa: {
        title: "TFSA",
        fullName: "Tax-Free Savings Account",
        purpose: "A highly flexible account for almost any savings goal.",
        annualContributionLimit: 7000, // 2024 limit
        lifetimeContributionLimit: 95000, // Cumulative for someone 18+ since 2009 up to 2024
        details: [
            { title: "Contributions", text: "Not tax-deductible. Made with after-tax money. Annual limit of $7,000 (2024). Cumulative room starts at age 18 (e.g., $95,000 as of 2024 if eligible since 2009)." },
            { title: "Growth", text: "Investment income and capital gains are completely tax-free, for life." },
            { title: "Withdrawals", text: "Completely tax-free, anytime, for any reason. Withdrawn amount is added back to contribution room the next year." },
            { title: "Age Limit", text: "None. Can be held for your entire life." }
        ],
        features: [
            { title: "Major Benefit", text: "The power of tax-free compounding is incredible for long-term growth." }
        ]
    },
    resp: {
        title: "RESP",
        fullName: "Registered Education Savings Plan",
        purpose: "To save for a child's post-secondary education.",
        annualContributionLimit: 'No annual limit, but grants max out at $2,500/year',
        lifetimeContributionLimit: 50000,
        details: [
            { title: "Contributions", text: "Not tax-deductible." },
            { title: "Growth", text: "Grows tax-deferred." },
            { title: "Government Grants", text: "The Canada Education Savings Grant (CESG) matches 20% of contributions up to $500 per year, up to a lifetime maximum per child." },
            { title: "Withdrawals", text: "Growth and grants are taxed in the hands of the student, who typically pays little to no tax." }
        ],
        features: []
    },
    rdsp: {
        title: "RDSP",
        fullName: "Registered Disability Savings Plan",
        purpose: "To help individuals with disabilities save for the long term.",
        annualContributionLimit: 'No annual limit',
        lifetimeContributionLimit: 200000,
        details: [
            { title: "Contributions", text: "Not tax-deductible." },
            { title: "Growth", text: "Grows tax-sheltered." },
            { title: "Government Grants", text: "Benefits from generous government grants and bonds." }
        ],
        features: []
    },
    nonRegistered: {
        title: "Non-Registered",
        fullName: "Non-Registered Account",
        purpose: "For investing after you've maxed out registered accounts.",
        annualContributionLimit: 'None',
        lifetimeContributionLimit: 'None',
        details: [
            { title: "Contributions", text: "No tax deduction and no contribution limits." },
            { title: "Growth", text: "All investment income (interest, dividends, capital gains) is taxable in the year it is earned." },
            { title: "Withdrawals", text: "No tax on withdrawal of principal, but realized capital gains are taxed." }
        ],
        features: []
    }
};

const productData = [
    {
        title: "Cash / High-Interest Savings Accounts (HISAs)",
        description: `
            <p><strong>What they are:</strong> A very low-risk way to save money. Your funds are easily accessible, making them ideal for short-term needs like an emergency fund.</p>
            <p><strong>Risk Level:</strong> Very Low</p>
        `
    },
    {
        title: "Guaranteed Investment Certificates (GICs)",
        description: `
            <p><strong>What they are:</strong> A low-risk investment where you lend money to a financial institution for a set period at a fixed interest rate. Your principal is guaranteed.</p>
            <p><strong>Risk Level:</strong> Very Low</p>
        `
    },
    {
        title: "Mutual Funds",
        description: `
            <p><strong>What they are:</strong> A pool of money from many investors, managed by a professional fund manager, invested in a diversified portfolio of stocks, bonds, or other securities. They aim to outperform a specific benchmark.</p>
            <p><strong>Risk Level:</strong> Varies (Low to High, depending on fund's holdings)</p>
        `
    },
    {
        title: "Exchange-Traded Funds (ETFs)",
        description: `
            <p><strong>What they are:</strong> Similar to mutual funds, but they trade like stocks on a stock exchange. Most ETFs are designed to track a specific index (e.g., S&P/TSX Composite Index) rather than actively manage a portfolio.</p>
            <p><strong>Risk Level:</strong> Varies (Medium to High, depending on underlying assets)</p>
        `
    },
    {
        title: "Stocks (Equities)",
        description: `
            <p><strong>What they are:</strong> Represents ownership in a publicly traded company. When you buy a stock, you own a small piece of that company. Their value can increase (capital gains) and may pay dividends.</p>
            <p><strong>Risk Level:</strong> High</p>
        `
    },
    {
        title: "Bonds",
        description: `
            <p><strong>What they are:</strong> Essentially, lending money to a government or corporation. In return, you receive regular interest payments, and your principal is returned at maturity. They are considered less risky than stocks.</p>
            <p><strong>Risk Level:</strong> Low to Medium (depending on issuer and term)</p>
        `
    }
];

const managementData = [
    {
        title: "Self-Directed Investing (DIY)",
        description: `
            <p><strong>What it is:</strong> You take full control of your investments. You open an account with a discount brokerage and decide which stocks, ETFs, GICs, or mutual funds to buy and sell. This requires active management and research on your part.</p>
            <p><strong>Examples of Platforms:</strong></p>
            <ul class="list-disc list-inside ml-4">
                <li>RBC Direct Investing</li>
                <li>TD Direct Investing</li>
                <li>BMO InvestorLine</li>
                <li>Scotia iTRADE</li>
                <li>CIBC Investor's Edge</li>
                <li>Questrade</li>
            </ul>
            <p><strong>Fees:</strong> Typically the lowest fees, mainly trading commissions (which can be $0 for ETFs at many platforms) plus the fees of the underlying investments (e.g., ETF MERs). Account administration fees might apply if your balance is below a certain threshold.</p>
            <p><strong>Best For:</strong> Investors who are knowledgeable, disciplined, and have the time and interest to actively manage their own portfolios.</p>
        `
    },
    {
        title: "Robo-Advisors (Hybrid Approach)",
        description: `
            <p><strong>What it is:</strong> An online investment management service that uses algorithms to build and manage a diversified portfolio of low-cost ETFs tailored to your risk tolerance and goals. You typically answer a questionnaire, and they recommend and manage a suitable portfolio.</p>
            <p><strong>Examples of Services:</strong></p>
            <ul class="list-disc list-inside ml-4">
                <li>RBC InvestEase</li>
                <li>Wealthsimple Invest</li>
                <li>Questwealth Portfolios (Questrade)</li>
                <li>BMO SmartFolio</li>
                <li>TD Automated Investing</li>
                <li>CI Direct Investing</li>
            </ul>
            <p><strong>Fees:</strong> Generally low. Management fees typically range from 0.25% to 0.50% of your assets annually. When including the fees of the underlying ETFs, the all-in cost is often between 0.5% and 0.8% per year. For example, RBC InvestEase has a management fee of 0.5%.</p>
            <p><strong>Historical Returns:</strong> For a balanced portfolio, robo-advisors generally track broad market performance, minus their fees. For example, RBC InvestEase's balanced portfolio showed annualized returns of roughly 6-13% over various periods (1-5 years, as of late 2024), reflecting market movements.</p>
            <p><strong>Best For:</strong> New investors, those who prefer a hands-off approach, or individuals who want diversified portfolios at a lower cost than traditional advisors.</p>
        `
    },
    {
        title: "Full-Service Financial Advisors",
        description: `
            <p><strong>What it is:</strong> You work with a human financial advisor who provides personalized financial planning, investment advice, and manages your portfolio. They offer comprehensive services, including retirement planning, tax strategies, and estate planning.</p>
            <p><strong>Examples of Services:</strong></p>
            <ul class="list-disc list-inside ml-4">
                <li>RBC Dominion Securities</li>
                <li>BMO Nesbitt Burns</li>
                <li>ScotiaMcLeod (Scotiabank)</li>
                <li>TD Wealth Private Client Group</li>
                <li>CI Assante Wealth Management</li>
                <li>IG Wealth Management</li>
            </ul>
            <p><strong>Fees:</strong> Generally the highest fees. Management fees can range from 1% to 2% or more of your assets under management annually, in addition to the fees of the underlying investment products (e.g., mutual fund MERs). These fees are for the comprehensive advice and hands-on management provided.</p>
            <p><strong>Best For:</strong> Individuals with complex financial situations, those who prefer hands-on guidance, or who are uncomfortable making investment decisions themselves.</p>
        `
    }
];

const detailedProductData = [
    {
        title: "High-Interest Savings Accounts (HISAs)",
        shortDescription: "Very low-risk, highly liquid savings for short-term goals or emergency funds.",
        icon: "💰", // Updated: using emoji icon
        content: `
            <p>HISAs offer a higher interest rate than traditional savings accounts, making them suitable for emergency funds or short-term savings goals. They are very low risk and liquid.</p>
            <h4 class="font-semibold text-gray-800 mt-4 mb-2">Examples in Canada:</h4>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li>EQ Bank Personal Account (often among the highest rates)</li>
                <li>Simplii Financial High Interest Savings Account</li>
                <li>Tangerine Savings Account</li>
                <li>BMO Savings Amplifier Account (often promotional rates)</li>
                <li>RBC High Interest eSavings Account (often promotional rates)</li>
                <li>Scotiabank MomentumPLUS Savings Account (often promotional rates)</li>
                <li>CIBC eAdvantage Savings Account (often promotional rates)</li>
                <li>Manulife Bank Advantage Account</li>
                <li>Oaken Financial Savings Account</li>
                <li>Neo Financial High-Interest Savings Account</li>
            </ul>
            <p class="mt-4"><strong>Typical Current Rates:</strong> 2% - 5% (often includes promotional bonuses for new money).
            <p class="mt-2 text-sm text-gray-500"><em>Note: HISA rates fluctuate with the Bank of Canada's overnight rate. Historically, long-term rates have been much lower than current promotional rates.</em></p>
        `
    },
    {
        title: "Guaranteed Investment Certificates (GICs)",
        shortDescription: "Fixed interest rate, principal guaranteed, for predictable returns.",
        icon: "🔒", // Updated: using emoji icon
        content: `
            <p>GICs are investments that guarantee your principal and offer a fixed rate of return over a set period. They are very low risk but less flexible than HISAs.</p>
            <h4 class="font-semibold text-gray-800 mt-4 mb-2">Common Types and Examples:</h4>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li><strong>Non-Redeemable GICs:</strong> Most common. Cannot be cashed before maturity without penalty.
                    <ul class="list-circle list-inside ml-8">
                        <li>RBC Non-Redeemable GICs (various terms)</li>
                        <li>TD Fixed Rate GICs (various terms)</li>
                        <li>EQ Bank GICs (competitive rates for various terms)</li>
                    </ul>
                </li>
                <li><strong>Cashable/Redeemable GICs:</strong> Can be cashed before maturity, usually after a waiting period (e.g., 30-90 days), but often offer a lower interest rate.
                    <ul class="list-circle list-inside ml-8">
                        <li>BMO Cashable GIC</li>
                        <li>Scotiabank Redeemable GIC</li>
                    </ul>
                </li>
                <li><strong>Market-Linked GICs:</strong> Principal is guaranteed, but returns are tied to the performance of an underlying index (e.g., stock market). May have potential for higher returns but also a minimum guaranteed return of 0%.
                    <ul class="list-circle list-inside ml-8">
                        <li>RBC Equity-Linked GICs</li>
                        <li>TD Canadian Banks GIC</li>
                    </ul>
                </li>
            </ul>
            <p class="mt-4"><strong>Typical Current Rates (Non-Redeemable):</strong>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li>1-Year GIC: 2.55% - 3.65%</li>
                <li>3-Year GIC: 2.65% - 3.70%</li>
                <li>5-Year GIC: 2.75% - 3.95%</li>
                <li>10-Year GIC: Around 3.25% - 3.35%</li>
            </ul>
            <p class="mt-2 text-sm text-gray-500"><em>Note: GIC rates vary by financial institution and term. Always compare offers.</em></p>
        `
    },
    {
        title: "Mutual Funds",
        shortDescription: "Professionally managed diversified portfolios, but often with higher fees.",
        icon: "📊", // Updated: using emoji icon
        content: `
            <p>Mutual funds are professionally managed pools of money invested in various securities. They offer diversification and professional expertise but typically come with higher fees.</p>
            <h4 class="font-semibold text-gray-800 mt-4 mb-2">Examples of Popular Categories/Funds in Canada:</h4>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li><strong>Canadian Equity Funds:</strong> Invest in Canadian stocks.
                    <ul class="list-circle list-inside ml-8">
                        <li>Mawer Canadian Equity Fund</li>
                        <li>RBC Canadian Equity Fund</li>
                        <li>TD Canadian Equity Fund</li>
                    </ul>
                </li>
                <li><strong>Canadian Fixed Income/Bond Funds:</strong> Invest in Canadian bonds.
                    <ul class="list-circle list-inside ml-8">
                        <li>CIBC Canadian Bond Fund</li>
                        <li>RBC Bond Fund</li>
                    </ul>
                </li>
                <li><strong>Balanced Funds:</strong> A mix of stocks and bonds, aiming for growth and income.
                    <ul class="list-circle list-inside ml-8">
                        <li>Mawer Balanced Fund</li>
                        <li>RBC Select Balanced Portfolio</li>
                        <li>TD Balanced Fund</li>
                    </ul>
                </li>
                <li><strong>Global/International Equity Funds:</strong> Invest in stocks outside of Canada.
                    <ul class="list-circle list-inside ml-8">
                        <li>Mawer International Equity Fund</li>
                        <li>RBC Global Equity Fund</li>
                    </ul>
                </li>
            </ul>
            <p class="mt-4"><strong>Typical Management Expense Ratios (MERs):</strong>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li>Actively Managed Canadian Equity Funds: Average ~2.45% annually</li>
                <li>Actively Managed Fixed Income Funds: Average ~1.62% annually</li>
                <li>Mawer Balanced Fund (lower end): ~0.91% annually</li>
            </ul>
            <p class="mt-4"><strong>Historical Performance:</strong> Varies greatly by fund and market conditions. Many actively managed mutual funds historically struggle to outperform their benchmarks after factoring in their higher fees over the long term. For example, a well-managed balanced fund might aim for annualized returns of 5-8% over the long term, but actual results can differ significantly.</p>
            <p class="mt-2 text-sm text-gray-500"><em>Note: High MERs can significantly reduce your net returns over time.</em></p>
        `
    },
    {
        title: "Exchange-Traded Funds (ETFs)",
        shortDescription: "Diversified baskets of investments that trade like stocks, with low fees.",
        icon: "📈", // Updated: using emoji icon
        content: `
            <p>ETFs are collections of investments that trade on stock exchanges, similar to individual stocks. Most ETFs are passively managed, meaning they aim to track a specific index, resulting in lower fees and broad diversification.</p>
            <h4 class="font-semibold text-gray-800 mt-4 mb-2">Examples of Popular ETFs (Canadian-listed):</h4>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li><strong>Canadian Equity ETFs (tracking TSX Composite):</strong>
                    <ul class="list-circle list-inside ml-8">
                        <li>Vanguard FTSE Canada Index ETF (VCE) - MER: 0.06%</li>
                        <li>iShares Core S&P/TSX Capped Composite Index ETF (XIC) - MER: 0.06%</li>
                        <li>BMO S&P/TSX Capped Composite Index ETF (ZCN) - MER: 0.06%</li>
                    </ul>
                </li>
                <li><strong>US Equity ETFs (tracking S&P 500 - Canadian-listed, CAD or CAD-hedged):</strong>
                    <ul class="list-circle list-inside ml-8">
                        <li>Vanguard S&P 500 Index ETF (VFV) - MER: 0.08% (CAD unhedged)</li>
                        <li>iShares Core S&P 500 Index ETF (XUS) - MER: 0.10% (CAD unhedged)</li>
                        <li>BMO S&P 500 Index ETF (ZSP) - MER: 0.09% (CAD unhedged)</li>
                        <li>Vanguard S&P 500 Index ETF (CAD-hedged) (VSP) - MER: 0.08% (CAD hedged)</li>
                    </ul>
                </li>
                <li><strong>US Total Market ETFs (Canadian-listed):</strong>
                    <ul class="list-circle list-inside ml-8">
                        <li>Vanguard US Total Market Index ETF (VUN) - MER: 0.17% (CAD unhedged)</li>
                    </ul>
                </li>
                <li><strong>Canadian Bond ETFs:</strong>
                    <ul class="list-circle list-inside ml-8">
                        <li>Vanguard Canadian Aggregate Bond Index ETF (VAB) - MER: 0.08%</li>
                        <li>iShares Core Canadian Universe Bond Index ETF (XBB) - MER: 0.19%</li>
                    </ul>
                </li>
                <li><strong>All-in-One Asset Allocation ETFs (convenient diversified portfolios):</strong>
                    <ul class="list-circle list-inside ml-8">
                        <li>Vanguard All-Equity ETF Portfolio (VEQT) - MER: 0.24%</li>
                        <li>Vanguard Balanced ETF Portfolio (VBAL) - MER: 0.24%</li>
                        <li>iShares Core Growth ETF Portfolio (XGRO) - MER: 0.20%</li>
                    </ul>
                </li>
            </ul>
            <p class="mt-4"><strong>Typical Management Expense Ratios (MERs):</strong> Very low, generally 0.05% to 0.50% for broad market index ETFs.</p>
            <p class="mt-4"><strong>Historical Performance:</strong>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li><strong>ETFs tracking TSX Composite Index (Canadian Equity):</strong> Historically averaged ~7-9% annualized returns over long periods. More recently, the TSX Composite had a YTD return of around 7.92% (as of June 10, 2025) and a 10-year annualized return of ~8.93% (as of June 9, 2025).</li>
                <li><strong>ETFs tracking S&P 500 Index (US Equity):</strong> Historically averaged >10% annualized returns over long periods. More recently, the S&P 500 had a 5-year CAGR of ~14.49% and a 10-year CAGR of ~10.17% (as of May 2025).</li>
            </ul>
            <p class="mt-2 text-sm text-gray-500"><em>Note: Performance figures for specific ETFs will closely mirror their underlying index, minus the MER. Currency hedging affects returns.</em></p>
        `
    },
    {
        title: "Stocks (Equities)",
        shortDescription: "Ownership in a company, offering high growth potential but also higher risk.",
        icon: "🏢", // Updated: using emoji icon
        content: `
            <p>Investing in individual stocks means buying ownership in a specific company. This can offer high growth potential but also carries higher risk than diversified funds.</p>
            <h4 class="font-semibold text-gray-800 mt-4 mb-2">Examples of Companies (across sectors, popular in Canada/US):</h4>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li><strong>Canadian Banks:</strong> Royal Bank of Canada (RY), Toronto-Dominion Bank (TD), Bank of Montreal (BMO), Bank of Nova Scotia (BNS) - generally stable, dividend-paying.</li>
                <li><strong>Canadian Energy:</strong> Enbridge Inc. (ENB), Canadian Natural Resources (CNQ), Suncor Energy (SU) - tied to commodity prices.</li>
                <li><strong>Canadian Tech/Growth:</strong> Shopify Inc. (SHOP), Constellation Software Inc. (CSU) - higher growth potential, often more volatile.</li>
                <li><strong>US Tech Giants:</strong> Apple Inc. (AAPL), Microsoft Corp. (MSFT), NVIDIA Corp. (NVDA), Amazon.com Inc. (AMZN), Meta Platforms Inc. (META) - dominant global companies, high growth, but also subject to market swings.</li>
                <li><strong>Canadian Utilities:</b> Fortis Inc. (FTS), Hydro One Ltd. (H) - generally stable, regulated companies often paying dividends.</li>
            </ul>
            <p class="mt-4"><strong>Historical Performance (Market Benchmarks):</strong>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li><strong>S&P/TSX Composite Index (Canadian Stock Market):</strong> Has historically averaged annualized returns of approximately 7-9% over very long periods (e.g., 50+ years).</li>
                <li><strong>S&P 500 Index (U.S. Stock Market):</strong> Has historically delivered average annual returns of over 10% since 1957.</li>
            </ul>
            <p class="mt-2 text-sm text-gray-500"><em>Note: Individual stock performance can deviate significantly from market averages. Diversification across many stocks or investing in equity ETFs is generally recommended to mitigate individual company risk.</em></p>
        `
    },
    {
        title: "Bonds",
        shortDescription: "Lending money to governments or corporations for regular interest payments.",
        icon: "🔗", // Updated: using emoji icon
        content: `
            <p>Bonds represent a loan made by an investor to a borrower (typically a government or corporation). In return, the borrower pays regular interest payments and repays the principal at maturity. Bonds are generally considered less risky than stocks.</p>
            <h4 class="font-semibold text-gray-800 mt-4 mb-2">Types and Examples:</h4>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li><strong>Government Bonds:</strong> Issued by federal, provincial, or municipal governments. Considered very low risk, especially federal bonds.
                    <ul class="list-circle list-inside ml-8">
                        <li>Government of Canada Bonds (e.g., 5-year, 10-year bonds)</li>
                        <li>Provincial Government Bonds (e.g., Ontario Bonds)</li>
                    </ul>
                </li>
                <li><strong>Corporate Bonds:</strong> Issued by companies. Carry more risk than government bonds but typically offer higher interest rates.
                    <ul class="list-circle list-inside ml-8">
                        <li>Bonds from major Canadian corporations (e.g., Bell Canada, Enbridge)</li>
                        <li>Investment-grade corporate bonds (higher credit rating, lower risk)</li>
                        <li>High-yield (junk) bonds (lower credit rating, higher risk, higher potential return)</li>
                    </ul>
                </li>
                <li><strong>Real Return Bonds (RRBs):</strong> Government bonds whose principal and interest payments are adjusted for inflation.
                    <ul class="list-circle list-inside ml-8">
                        <li>Government of Canada Real Return Bonds</li>
                    </ul>
                </li>
            </ul>
            <p class="mt-4"><strong>Typical Yields / Historical Performance:</strong>
            <ul class="list-disc list-inside ml-4 space-y-1">
                <li><strong>Canadian Government Bonds:</strong> Current yields on 5-year Government of Canada benchmark bonds are around 2.96% (as of June 6, 2025). Long-term historical returns have generally been in the 2-4% annualized range.</li>
                <li><strong>Canadian Corporate Bonds:</strong> Generally offer slightly higher yields than government bonds, often 0.5% - 1.5% higher depending on the issuer's credit quality and bond term. Funds tracking corporate bonds have seen returns like 1.31% YTD, 7.07% (2024), 8.16% (2023).</li>
            </ul>
            <p class="mt-2 text-sm text-gray-500"><em>Note: Bond prices move inversely to interest rates. When interest rates rise, existing bond prices typically fall, and vice versa.</em></p>
        `
    }
];

const considerationsData = [
    { icon: '💳', title: 'Social Insurance Number (SIN)', text: 'A valid SIN is required to open any registered investment account in Canada.' },
    { icon: '⚖️', title: 'Risk Tolerance', text: 'Honestly assess your comfort with potential losses. This dictates your investment choices.' },
    { icon: '🗓️', title: 'Investment Horizon', text: 'When do you need the money? Long-term goals can handle more risk than short-term ones.' },
    { icon: '🧺', title: 'Diversification', text: "Don't put all your eggs in one basket. Spread investments across different assets and geographies." },
    { icon: '💰', title: 'Fees', text: 'Be mindful of fees! Even small percentages significantly erode returns over time.' },
    { icon: '📈', title: 'Compounding', text: 'Start early to let your returns earn returns, growing your wealth exponentially.' },
    { icon: '📚', title: 'Financial Literacy', text: 'Continuously learn about investing. Knowledge is your best tool.' },
    { icon: '🔥', title: 'Inflation', text: 'Investing helps your money grow faster than the rate of inflation, preserving your purchasing power.' },
    { icon: '🆘', title: 'Emergency Fund', text: 'Before investing, secure 3-6 months of living expenses in an easily accessible savings account.' },
    { icon: '🇨🇦', title: 'Tax Residency', text: 'Understand your status as a Canadian resident for tax purposes, as it affects your eligibility.' }
];

const recommendationDataHtml = `
    <h3 class="text-xl font-bold mb-4">A Suggested Path to Get Started</h3>
    <p class="mb-4">For most newcomers, the best approach is to prioritize flexibility and tax efficiency. Here’s a recommended order of operations:</p>
    <ol class="list-decimal list-inside space-y-4">
        <li>
            <span class="font-semibold">Build an Emergency Fund:</span> Before anything else, save 3-6 months of living expenses in a High-Interest Savings Account (HISA).
        </li>
        <li>
            <span class="font-semibold">Maximize your FHSA (if applicable):</span> If buying a home in Canada is a goal, the FHSA offers an unparalleled combination of a tax deduction on contributions and tax-free withdrawals for a home purchase. This should be your first priority.
        </li>
        <li>
            <span class="font-semibold">Maximize your TFSA:</span> The tax-free growth and flexible, tax-free withdrawals make the TFSA an incredibly powerful and versatile tool for any goal. It's often wise to fill this before an RRSP, especially if you expect your income to rise in the future.
        </li>
    </ol>
    <h3 class="text-xl font-bold mt-6 mb-4">How to Start Investing?</h3>
    <p>For the investment management style, starting with a <strong>Robo-Advisor like RBC InvestEase</strong> is highly recommended. It's simple, low-cost, and ensures your portfolio is professionally managed and diversified from day one, removing the guesswork and stress of doing it yourself.</p>
`;

// --- Reusable Components ---

// Modal Component
const Modal = ({ isOpen, onClose, data, type, isDarkMode }) => {
    if (!isOpen) return null;

    const modalBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const modalBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const modalShadowClass = isDarkMode ? 'shadow-indigo-500/20' : 'shadow-blue-200/50';
    const titleColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-700';
    const textColorClass = isDarkMode ? 'text-gray-200' : 'text-gray-800';
    const subtitleColorClass = isDarkMode ? 'text-gray-300' : 'text-gray-500';
    const featureBgClass = isDarkMode ? 'bg-gray-700' : 'bg-blue-50';
    const featureBorderClass = isDarkMode ? 'border-indigo-600' : 'border-blue-200';
    const featureTitleColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-800';
    const featureTextColorClass = isDarkMode ? 'text-gray-200' : 'text-blue-700';
    const closeButtonBgClass = isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700';
    const closeButtonTextColorClass = 'text-white'; // Always white for contrasting buttons

    let modalContentHTML = '';
    if (type === 'account') {
        modalContentHTML = (
            <>
                <h2 className={`text-3xl font-bold ${titleColorClass} mb-1`}>{data.title}</h2>
                <p className={`${subtitleColorClass} text-lg mb-4`}>{data.fullName}</p>
                <p className={`text-lg ${textColorClass} mb-6`}>{data.purpose}</p>

                <div className="space-y-4 mb-6">
                    {data.details.map((d, index) => (
                        <div key={index}>
                            <h4 className={`font-semibold ${textColorClass}`}>{d.title}</h4>
                            <p className={`${subtitleColorClass}`}>{d.text}</p>
                        </div>
                    ))}
                </div>

                {data.features.length > 0 && (
                    <div className={`${featureBgClass} p-4 rounded-lg border ${featureBorderClass}`}>
                        <h4 className={`font-semibold text-lg ${featureTitleColorClass} mb-2`}>Key Feature(s)</h4>
                        {data.features.map((f, index) => (
                            <div key={index} className="mt-2">
                                <p className={`${featureTextColorClass}`}><strong className="font-medium">{f.title}:</strong> {f.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    } else if (type === 'product') {
        modalContentHTML = (
            <>
                <h2 className={`text-3xl font-bold ${titleColorClass} mb-4`}>{data.title}</h2>
                <div className={`${textColorClass} text-base space-y-4`} dangerouslySetInnerHTML={{ __html: data.content }}></div>
            </>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className={`${modalBgClass} rounded-lg shadow-2xl ${modalShadowClass} p-8 max-w-3xl w-full relative modal-content show border ${modalBorderClass}`} onClick={e => e.stopPropagation()}>
                <button className={`absolute top-4 right-4 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} text-2xl font-bold transition-colors`} onClick={onClose}>&times;</button>
                {modalContentHTML}
                <button className={`mt-8 ${closeButtonBgClass} ${closeButtonTextColorClass} py-2 px-4 rounded-lg shadow-md transition-colors`} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

// Accordion Item Component
const AccordionItem = ({ title, content, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current && isOpen) {
            contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
        } else if (contentRef.current) {
            contentRef.current.style.maxHeight = '0px';
        }
    }, [isOpen, content]);

    const itemBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const itemBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const titleColorClass = isDarkMode ? 'text-gray-100' : 'text-gray-700';
    const arrowColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-500';
    const contentTextColorClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

    return (
        <div className={`${itemBorderClass} rounded-lg mb-4 ${itemBgClass} transition-all duration-300 accordion-item`}>
            <button className="w-full text-left py-4 px-6 focus:outline-none flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
                <span className={`font-semibold text-lg ${titleColorClass}`}>{title}</span>
                <span className={`transform transition-transform duration-300 ${arrowColorClass} ${isOpen ? 'rotate-180' : 'rotate(0deg)'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div
                ref={contentRef}
                className={`accordion-content px-6 pb-4 ${contentTextColorClass}`}
                style={{ maxHeight: '0px' }}
            >
                <div dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
        </div>
    );
};

// --- Section Components ---

const AccountTypes = ({ openModal, isActive, isDarkMode }) => (
    <section id="accounts" className={`content-section ${isActive ? 'active' : ''}`}>
        <div className="text-center mb-10 max-w-4xl mx-auto">
            <h2 className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Registered Accounts: The Tax-Advantaged Buckets</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Canada offers special accounts with unique tax benefits to help you save for specific goals. Click on any account below to learn more about its purpose, how it works, and its key features.</p>
        </div>
        <div id="accounts-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.values(accountData).map((account, index) => {
                const cardBgClass = isDarkMode ? 'linear-gradient(135deg, #1F2937 0%, #2D3748 100%)' : 'linear-gradient(135deg, #F0F4F8 0%, #E2E6EC 100%)';
                const cardBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';
                const cardShadowClass = isDarkMode ? 'shadow-indigo-500/10 hover:shadow-indigo-500/20' : 'shadow-blue-200/50 hover:shadow-blue-300/50';
                const titleColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-700';
                const fullNameColorClass = isDarkMode ? 'text-gray-200' : 'text-gray-800';
                const purposeColorClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

                return (
                    <div
                        key={index}
                        className={`account-card p-8 shadow-xl ${cardShadowClass} transition-all duration-300 transform hover:-translate-y-2 cursor-pointer`}
                        style={{ background: cardBgClass, border: `1px solid ${isDarkMode ? '#374151' : '#CBD5E1'}` }}
                        onClick={() => openModal(account, 'account')}
                    >
                        <h3 className={`text-3xl font-bold ${titleColorClass} mb-3`}>{account.title}</h3>
                        <p className={`${fullNameColorClass} mb-3 text-lg`}>{account.fullName}</p>
                        <p className={`${purposeColorClass} text-sm`}>{account.purpose}</p>
                    </div>
                );
            })}
        </div>
    </section>
);

const CompareAccounts = ({ isActive, isDarkMode }) => {
    const [chartType, setChartType] = useState('contribution');

    const getChartDataAndOptions = () => {
        let data, chartLabel, yAxisLabel, backgroundColors, borderColors;
        const labels = ['FHSA', 'RRSP', 'TFSA'];

        if (chartType === 'contribution') {
            data = [1, 1, 0];
            chartLabel = "Are Contributions Tax-Deductible?";
            yAxisLabel = 'Deductible';
            backgroundColors = isDarkMode ? ['rgba(99, 102, 241, 0.7)', 'rgba(99, 102, 241, 0.7)', 'rgba(248, 113, 113, 0.7)'] : ['rgba(74, 222, 128, 0.7)', 'rgba(74, 222, 128, 0.7)', 'rgba(239, 68, 68, 0.7)'];
            borderColors = isDarkMode ? ['#6366F1', '#6366F1', '#F87171'] : ['#4ADE80', '#4ADE80', '#EF4444'];
        } else if (chartType === 'withdrawal') {
            data = [1, 0, 1];
            chartLabel = "Are Withdrawals Tax-Free?";
            yAxisLabel = 'Tax-Free';
            backgroundColors = isDarkMode ? ['rgba(99, 102, 241, 0.7)', 'rgba(248, 113, 113, 0.7)', 'rgba(99, 102, 241, 0.7)'] : ['rgba(74, 222, 128, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(74, 222, 128, 0.7)'];
            borderColors = isDarkMode ? ['#6366F1', '#F87171', '#6366F1'] : ['#4ADE80', '#EF4444', '#4ADE80'];
        } else if (chartType === 'annual-limit') {
            data = [
                accountData.fhsa.annualContributionLimit,
                accountData.rrsp.annualContributionLimit,
                accountData.tfsa.annualContributionLimit
            ];
            chartLabel = "Annual Contribution Limits (2024)";
            yAxisLabel = 'Amount ($)';
            backgroundColors = isDarkMode ? ['rgba(96, 165, 250, 0.7)', 'rgba(129, 140, 248, 0.7)', 'rgba(167, 139, 250, 0.7)'] : ['rgba(59, 130, 246, 0.7)', 'rgba(124, 58, 237, 0.7)', 'rgba(168, 85, 247, 0.7)'];
            borderColors = isDarkMode ? ['#60A5FA', '#818CF8', '#A78BFA'] : ['#3B82F6', '#7C3AED', '#A855F7'];
        }

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartLabel,
                    font: { size: 20, weight: 'bold' },
                    color: isDarkMode ? '#E5E7EB' : '#374151', // Light gray for title in dark, dark gray in light
                },
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (chartType === 'contribution' || chartType === 'withdrawal') {
                                return context.raw === 1 ? 'Yes' : 'No';
                            } else if (chartType === 'annual-limit') {
                                return context.label + ': $' + context.raw.toLocaleString();
                            }
                            return context.raw;
                        },
                    },
                    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)', // Dark background for tooltip in dark, light in light
                    titleColor: isDarkMode ? '#E5E7EB' : '#374151',
                    bodyColor: isDarkMode ? '#D1D5DB' : '#4B5563',
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (chartType === 'contribution' || chartType === 'withdrawal') {
                                if (value === 1) return 'Yes';
                                if (value === 0) return 'No';
                                return '';
                            } else if (chartType === 'annual-limit') {
                                return `$${value.toLocaleString()}`;
                            }
                            return value;
                        },
                        stepSize: (chartType === 'contribution' || chartType === 'withdrawal') ? 1 : undefined,
                        font: { size: 12 },
                        color: isDarkMode ? '#9CA3AF' : '#6B7280', // Lighter gray for ticks
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)', // Darker grid lines in dark, lighter in light
                    },
                    title: {
                        display: true,
                        text: yAxisLabel,
                        font: { size: 14, weight: 'bold' },
                        color: isDarkMode ? '#D1D5DB' : '#4B5563', // Lighter gray for axis title
                    },
                },
                x: {
                    ticks: {
                        font: { size: 12 },
                        color: isDarkMode ? '#9CA3AF' : '#6B7280', // Lighter gray for ticks
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)', // Darker grid lines in dark, lighter in light
                    },
                },
            },
        };

        return {
            data: {
                labels,
                datasets: [{
                    label: yAxisLabel,
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 8, // Rounded bars
                }],
            },
            options
        };
    };

    const { data: chartData, options: chartOptions } = getChartDataAndOptions();

    const comparisonTable = (
        <table className="comparison-table">
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>FHSA</th>
                    <th>RRSP</th>
                    <th>TFSA</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Primary Purpose</td><td>First Home Down Payment</td><td>Retirement Savings</td><td>Flexible Savings (Any Goal)</td></tr>
                <tr><td>Contribution Deductible?</td><td>Yes</td><td>Yes</td><td>No</td></tr>
                <tr><td>Growth Tax Treatment</td><td>Tax-Deferred (tax paid on withdrawal)</td><td>Tax-Free</td><td>Tax-Free</td></tr>
                <tr><td>Withdrawals Taxable?</td><td>No (if for qualifying home)</td><td>Yes (as income)</td><td>No (completely tax-free)</td></tr>
                <tr><td>Annual Contribution Limit (2024)</td><td>$8,000</td><td>18% of prior year's earned income (max $31,560)</td><td>$7,000</td></tr>
                <tr><td>Lifetime Contribution Limit</td><td>$40,000</td><td>Based on unused room (variable)</td><td>Cumulative (e.g., $95,000 as of 2024)</td></tr>
                <tr><td>Withdrawal Flexibility</td><td>High (tax-free for qualifying home purchase)</td><td>Limited (taxable, HBP/LLP exceptions)</td><td>High (tax-free, re-contribution next year)</td></tr>
                <tr><td>Age Limit/Expiry</td><td>15 years or age 71</td><td>Must convert by age 71</td><td>None</td></tr>
                <tr><td>Impact on Gov. Benefits</td><td>None (contributions reduce taxable income)</td><td>Withdrawals may impact clawbacks</td><td>No impact</td></tr>
            </tbody>
        </table>
    );

    const sectionBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const sectionBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const sectionShadowClass = isDarkMode ? 'shadow-indigo-500/10' : 'shadow-blue-100/50';
    const tableHeaderColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-700';
    const tableCellBgClass = isDarkMode ? 'bg-2D3748' : 'bg-white';
    const tableOddRowBgClass = isDarkMode ? 'bg-1F2937' : 'bg-gray-50';
    const tableHoverBgClass = isDarkMode ? 'bg-374151' : 'bg-gray-100';
    const chartButtonBaseBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-300';
    const chartButtonBaseTextColorClass = isDarkMode ? 'text-gray-200' : 'text-gray-800';
    const chartButtonActiveBgClass = isDarkMode ? 'bg-indigo-600' : 'bg-blue-600';
    const chartButtonActiveHoverClass = isDarkMode ? 'hover:bg-indigo-700' : 'hover:bg-blue-700';

    return (
        <section id="compare" className={`content-section ${isActive ? 'active' : ''}`}>
            <div className="text-center mb-10 max-w-4xl mx-auto">
                <h2 className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Compare Accounts Side-by-Side</h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Understanding the nuances between registered accounts is key. Use the buttons below the chart to visualize different comparison metrics, and refer to the detailed table for a comprehensive overview.</p>
            </div>
            <div className={`${sectionBgClass} p-8 rounded-lg shadow-xl ${sectionShadowClass} border ${sectionBorderClass} mb-8`}>
                <div className="chart-container">
                    <Bar options={chartOptions} data={chartData} />
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <button
                        className={`chart-toggle-btn py-3 px-6 rounded-full shadow-md text-sm font-semibold transition-all duration-300
                            ${chartType === 'contribution' ? `${chartButtonActiveBgClass} text-white ${chartButtonActiveHoverClass}` : `${chartButtonBaseBgClass} ${chartButtonBaseTextColorClass} ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-400'}`}`}
                        onClick={() => setChartType('contribution')}
                    >
                        Contribution Taxability
                    </button>
                    <button
                        className={`chart-toggle-btn py-3 px-6 rounded-full shadow-md text-sm font-semibold transition-all duration-300
                            ${chartType === 'withdrawal' ? `${chartButtonActiveBgClass} text-white ${chartButtonActiveHoverClass}` : `${chartButtonBaseBgClass} ${chartButtonBaseTextColorClass} ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-400'}`}`}
                        onClick={() => setChartType('withdrawal')}
                    >
                        Withdrawal Taxability
                    </button>
                    <button
                        className={`chart-toggle-btn py-3 px-6 rounded-full shadow-md text-sm font-semibold transition-all duration-300
                            ${chartType === 'annual-limit' ? `${chartButtonActiveBgClass} text-white ${chartButtonActiveHoverClass}` : `${chartButtonBaseBgClass} ${chartButtonBaseTextColorClass} ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-400'}`}`}
                        onClick={() => setChartType('annual-limit')}
                    >
                        Annual Contribution Limits
                    </button>
                </div>
            </div>

            <div className={`${sectionBgClass} p-8 rounded-lg shadow-xl ${sectionShadowClass} border ${sectionBorderClass}`}>
                <h3 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detailed Account Comparison Table</h3>
                <div id="comparison-table-container">
                    {comparisonTable}
                </div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-6 text-center`}>
                    <em>Note: Contribution limits are based on current (2024) figures and can change annually. RRSP contribution room is based on 18% of prior year's earned income up to the annual maximum. TFSA cumulative room varies by individual.</em>
                </p>
            </div>

            <div className={`${sectionBgClass} p-8 rounded-lg shadow-xl ${sectionShadowClass} border ${sectionBorderClass} mt-8`}>
                <h3 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>When to Prioritize Each Account</h3>
                <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} space-y-4`}>
                    <p><strong className={`font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-blue-700'}`}>FHSA:</strong> Ideal if you are a **first-time home buyer** in Canada planning to purchase a home within the next 15 years. It offers the best of both worlds: tax-deductible contributions (like an RRSP) and tax-free withdrawals for a home purchase (like a TFSA).</p>
                    <p><strong className={`font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-blue-700'}`}>TFSA:</strong> Excellent for **any financial goal** due to completely tax-free growth and withdrawals. Prioritize if you anticipate being in a higher tax bracket in the future than you are now, or for flexible savings like an emergency fund or short-to-medium term goals.</p>
                    <p><strong className={`font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-blue-700'}`}>RRSP:</strong> Best for **long-term retirement savings**, especially if you are currently in a **higher income tax bracket** and expect to be in a lower one during retirement. The immediate tax deduction can be very beneficial.</p>
                </div>
            </div>
        </section>
    );
};

const HowToInvest = ({ isActive, isDarkMode }) => {
    const sectionBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const sectionBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const sectionShadowClass = isDarkMode ? 'shadow-indigo-500/10' : 'shadow-blue-100/50';

    return (
        <section id="how-to" className={`content-section ${isActive ? 'active' : ''}`}>
            <div className="text-center mb-10 max-w-4xl mx-auto">
                <h2 className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>How to Invest: Products & Management</h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Once you've chosen an account (the "bucket"), you need to decide what to put inside it (the "products") and who will manage it. Explore the options below to understand your choices.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div id="investment-products">
                    <h3 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Investment Products</h3>
                    {productData.map((item, index) => (
                        <AccordionItem key={index} title={item.title} content={item.description} isDarkMode={isDarkMode} />
                    ))}
                </div>
                <div id="management-styles">
                     <h3 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Management Styles</h3>
                     {managementData.map((item, index) => (
                        <AccordionItem key={index} title={item.title} content={item.description} isDarkMode={isDarkMode} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const InvestmentProductsDeepDive = ({ openModal, isActive, isDarkMode }) => (
    <section id="products-deep-dive" className={`content-section ${isActive ? 'active' : ''}`}>
        <div className="text-center mb-10 max-w-4xl mx-auto">
            <h2 className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Investment Products Deep Dive</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Explore specific examples and typical performance for various investment products available in Canada. Remember, past performance is not an indicator of future results.</p>
        </div>
        <div id="detailed-products-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {detailedProductData.map((item, index) => {
                const cardBgClass = isDarkMode ? 'linear-gradient(135deg, #1F2937 0%, #2D3748 100%)' : 'linear-gradient(135deg, #F0F4F8 0%, #E2E6EC 100%)';
                const cardBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';
                const cardShadowClass = isDarkMode ? 'shadow-indigo-500/10 hover:shadow-indigo-500/20' : 'shadow-blue-200/50 hover:shadow-blue-300/50';
                const iconBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
                const iconColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-600';
                const titleColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-700';
                const shortDescColorClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';

                return (
                    <div
                        key={index}
                        className={`product-card p-8 shadow-xl ${cardShadowClass} transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-center flex flex-col items-center`}
                        style={{ background: cardBgClass, border: `1px solid ${isDarkMode ? '#374151' : '#CBD5E1'}` }}
                        onClick={() => openModal(item, 'product')}
                    >
                        <span className={`text-6xl mb-4 ${iconColorClass} p-4 ${iconBgClass} rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                            {item.icon}
                        </span>
                        <h3 className={`text-2xl font-bold ${titleColorClass} mb-2`}>{item.title}</h3>
                        <p className={`${shortDescColorClass} text-sm flex-grow`}>{item.shortDescription}</p>
                    </div>
                );
            })}
        </div>
    </section>
);

const KeyConsiderations = ({ isActive, isDarkMode }) => (
    <section id="considerations" className={`content-section ${isActive ? 'active' : ''}`}>
        <div className="text-center mb-10 max-w-4xl mx-auto">
            <h2 className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Important Considerations for Newcomers</h2>
             <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Before you start investing, keep these crucial points in mind. They will help you build a solid financial foundation and avoid common pitfalls.</p>
        </div>
        <div id="considerations-list" className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {considerationsData.map((item, index) => {
                const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
                const cardBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
                const cardShadowClass = isDarkMode ? 'shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20' : 'shadow-lg shadow-blue-100/50 hover:shadow-blue-200/50';
                const iconColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-600';
                const titleColorClass = isDarkMode ? 'text-gray-100' : 'text-gray-800';
                const textColorClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

                return (
                    <div key={index} className={`${cardBgClass} p-6 rounded-lg ${cardShadowClass} border ${cardBorderClass} flex items-start transition-all duration-300`}>
                        <span className={`text-4xl mr-4 ${iconColorClass}`}>{item.icon}</span>
                        <div>
                            <h4 className={`font-bold text-xl ${titleColorClass} mb-1`}>{item.title}</h4>
                            <p className={`${textColorClass} text-sm`}>{item.text}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    </section>
);

const MyRecommendation = ({ isActive, isDarkMode }) => {
    const sectionBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const sectionBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const sectionShadowClass = isDarkMode ? 'shadow-xl shadow-indigo-500/10' : 'shadow-blue-100/50';
    const textColorClass = isDarkMode ? 'text-gray-200' : 'text-gray-700';

    return (
        <section id="recommendation" className={`content-section ${isActive ? 'active' : ''}`}>
            <div className="text-center mb-10 max-w-4xl mx-auto">
                <h2 className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>My Recommendation for a Newcomer</h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Based on the options, here is a suggested path for a newcomer to get started with investing in Canada. This approach prioritizes flexibility and long-term growth.</p>
            </div>
            <div className={`max-w-3xl mx-auto ${sectionBgClass} p-10 rounded-lg ${sectionShadowClass} border ${sectionBorderClass}`}>
                <div id="recommendation-content" className={`${textColorClass}`} dangerouslySetInnerHTML={{ __html: recommendationDataHtml }}></div>
            </div>
        </section>
    );
};

const InvestmentGlossary = ({ isActive, isDarkMode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [explanation, setExplanation] = useState(`<p class="text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Your explanation will appear here.</p>`);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setExplanation(`<p class="text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Your explanation will appear here.</p>`);
    }, [isDarkMode]); // Reset explanation text color when dark mode changes

    const explainTerm = async () => {
        if (!searchTerm.trim()) {
            setExplanation(`<p class="text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}">Please enter a term to explain.</p>`);
            return;
        }

        setExplanation('');
        setIsLoading(true);

        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: `Explain "${searchTerm}" in simple terms for a newcomer to Canada. Focus on its relevance to Canadian investing. Keep it concise, around 3-4 sentences.` }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setExplanation(`<p>${text}</p>`);
            } else {
                setExplanation(`<p class="text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}">Sorry, I could not generate an explanation for that term.</p>`);
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setExplanation(`<p class="text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}">An error occurred. Please try again later.</p>`);
        } finally {
            setIsLoading(false);
        }
    };

    const sectionBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const sectionBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const sectionShadowClass = isDarkMode ? 'shadow-indigo-500/10' : 'shadow-blue-100/50';
    const inputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-white';
    const inputBorderClass = isDarkMode ? 'border-gray-600' : 'border-gray-300';
    const inputTextColorClass = isDarkMode ? 'text-white' : 'text-gray-800';
    const inputPlaceholderClass = isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500';
    const inputFocusRingClass = isDarkMode ? 'focus:ring-indigo-500' : 'focus:ring-blue-500';
    const buttonBgClass = isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700';
    const buttonShadowClass = isDarkMode ? 'shadow-md' : 'shadow-lg'; // Adjusted for light mode
    const outputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
    const outputBorderClass = isDarkMode ? 'border-gray-600' : 'border-gray-200';
    const outputTextColorClass = isDarkMode ? 'text-gray-200' : 'text-gray-700';
    const spinnerBorderTopColorClass = isDarkMode ? 'border-t-indigo-400' : 'border-t-blue-500';

    return (
        <section id="glossary" className={`content-section ${isActive ? 'active' : ''}`}>
            <div className="text-center mb-10 max-w-4xl mx-auto">
                <h2 className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Investment Glossary ✨</h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Have a financial term you don't understand? Enter it below and let our AI-powered glossary provide a concise explanation for you!</p>
            </div>
            <div className={`${sectionBgClass} p-8 rounded-lg shadow-xl ${sectionShadowClass} max-w-2xl mx-auto border ${sectionBorderClass}`}>
                <div className="flex flex-col sm:flex-row items-center mb-6 gap-4">
                    <input
                        type="text"
                        id="glossary-input"
                        placeholder="e.g., Diversification, Capital Gains"
                        className={`flex-grow p-3 text-lg border ${inputBorderClass} rounded-lg ${inputBgClass} ${inputTextColorClass} focus:outline-none focus:ring-2 ${inputFocusRingClass} ${inputPlaceholderClass} w-full sm:w-auto`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') explainTerm(); }}
                    />
                    <button
                        id="explain-btn"
                        className={`${buttonBgClass} text-white py-3 px-6 rounded-lg ${buttonShadowClass} transition-colors flex items-center justify-center font-semibold text-lg w-full sm:w-auto`}
                        onClick={explainTerm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className={`loading-spinner border-white ${spinnerBorderTopColorClass}`}></div>
                                <span className="ml-2">Explaining...</span>
                            </>
                        ) : (
                            'Explain Term'
                        )}
                    </button>
                </div>
                <div id="glossary-output" className={`p-6 ${outputBgClass} rounded-lg border ${outputBorderClass} min-h-[120px] ${outputTextColorClass} flex items-center justify-center text-center`}>
                    <div dangerouslySetInnerHTML={{ __html: explanation }}></div>
                </div>
            </div>
        </section>
    );
};

const InvestmentGame = ({ isActive, isDarkMode }) => {
    const [userProfile, setUserProfile] = useState({});
    const [currentStageIndex, setCurrentStageIndex] = useState(0);

    const gameStages = [
        'start',
        'stage1_goals',
        'stage2_risk_horizon',
        'stage3_involvement',
        'results'
    ];

    const goToNextStage = () => {
        setCurrentStageIndex(prev => prev + 1);
    };

    const goToPrevStage = () => {
        setCurrentStageIndex(prev => prev - 1);
    };

    const handleGoalSelect = (goal) => {
        setUserProfile(prev => ({ ...prev, goal }));
    };

    const handleHomeBuyerSelect = (isHomeBuyer) => {
        setUserProfile(prev => ({ ...prev, firstTimeHomeBuyer: isHomeBuyer }));
    };

    const handleSliderChange = (attribute, value) => {
        setUserProfile(prev => ({ ...prev, [attribute]: parseInt(value) }));
    };

    const calculateRecommendation = () => {
        let accountRec = "";
        let productRec = "";
        let managementRec = "";

        // Determine Account Recommendation
        if (userProfile.goal === "Home" && userProfile.firstTimeHomeBuyer) {
            accountRec = "FHSA (First Home Savings Account)";
        } else if (userProfile.goal === "Retirement" && userProfile.timeHorizon >= 8) {
            accountRec = "RRSP (Registered Retirement Savings Plan)";
        } else if (userProfile.goal === "Education") {
            accountRec = "RESP (Registered Education Savings Plan)";
        } else {
            accountRec = "TFSA (Tax-Free Savings Account)";
        }

        // Determine Product Recommendation based on Risk Tolerance and Time Horizon
        const riskLevel = userProfile.riskTolerance;
        const timeYears = userProfile.timeHorizon;

        if (riskLevel <= 3 && timeYears <= 3) {
            productRec = "High-Interest Savings Accounts (HISAs) or Guaranteed Investment Certificates (GICs). These offer safety and predictability for short-term needs.";
        } else if (riskLevel <= 3 && timeYears > 3) {
            productRec = "Conservative bond funds or balanced ETFs with a high bond allocation. While low risk, long-term low risk can mean losing to inflation.";
        } else if (riskLevel >= 4 && riskLevel <= 7 && timeYears <= 7) {
            productRec = "Balanced Exchange-Traded Funds (ETFs) or diversified mutual funds. These offer a good blend of growth and relative stability.";
        } else if (riskLevel >= 4 && riskLevel <= 7 && timeYears > 7) {
            productRec = "Growth-oriented Balanced ETFs or diversified equity ETFs. You have time to recover from market fluctuations.";
        } else if (riskLevel >= 8 && timeYears >= 8) {
            productRec = "Growth-focused Equity Exchange-Traded Funds (ETFs) or a diversified portfolio of individual stocks. Be prepared for significant volatility for higher potential returns.";
        } else {
            productRec = "A diversified mix of investment products. Consider starting with broadly diversified ETFs and adjust based on your comfort and goals.";
        }

        // Determine Management Style Recommendation
        const involvementLevel = userProfile.managementInvolvement;
        if (involvementLevel <= 3) {
            managementRec = "A Robo-Advisor (like RBC InvestEase) or a Full-Service Financial Advisor if you prefer human guidance and have complex financial needs. Robo-advisors are generally more cost-effective.";
        } else if (involvementLevel >= 4 && involvementLevel <= 7) {
            managementRec = "A Robo-Advisor (like RBC InvestEase). They provide professional management with automated features while you learn the ropes.";
        } else {
            managementRec = "A Self-Directed (DIY) brokerage account (e.g., Questrade, RBC Direct Investing). This gives you full control, but requires active learning and management on your part.";
        }

        return { accountRec, productRec, managementRec };
    };

    const sectionBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const sectionBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const sectionShadowClass = isDarkMode ? 'shadow-indigo-500/10' : 'shadow-blue-100/50';
    const headerTextColorClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const textBaseColorClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const buttonBgClass = isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700';
    const optionButtonBgClass = isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200';
    const optionButtonTextColorClass = isDarkMode ? 'text-gray-100' : 'text-gray-700';
    const optionButtonSelectedClass = isDarkMode ? 'selected-dark' : 'selected-light'; // New classes for selected state
    const sliderTrackColorClass = isDarkMode ? '#374151' : '#CBD5E1';
    const sliderThumbColorClass = isDarkMode ? '#6366F1' : '#3B82F6';
    const sliderLabelColorClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const summaryBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
    const summaryBorderClass = isDarkMode ? 'border-gray-600' : 'border-gray-200';
    const summaryHeaderColorClass = isDarkMode ? 'text-indigo-400' : 'text-blue-700';
    const summaryTextColorClass = isDarkMode ? 'text-gray-200' : 'text-gray-700';
    const summaryAccentColorClass = isDarkMode ? 'text-indigo-300' : 'text-blue-600';
    const recommendationBoxBgClass = isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50';
    const recommendationBoxBorderClass = isDarkMode ? 'border-blue-800' : 'border-blue-200';
    const recommendationBoxTextColorClass = isDarkMode ? 'text-blue-100' : 'text-blue-800';

    const renderStage = () => {
        const currentStage = gameStages[currentStageIndex];

        switch (currentStage) {
            case 'start':
                return (
                    <div className="text-center">
                        <h3 className={`text-2xl font-semibold mb-4 ${headerTextColorClass}`}>Ready to find your investment match?</h3>
                        <p className={`${textBaseColorClass} mb-6`}>This quick quiz will help you understand which investment accounts and products might be best for you based on your goals, risk tolerance, and time horizon.</p>
                        <button
                            id="start-game-btn"
                            className={`${buttonBgClass} text-white py-3 px-8 rounded-lg shadow-md transition-colors font-semibold text-lg`}
                            onClick={() => {
                                setUserProfile({}); // Reset profile on new game start
                                setCurrentStageIndex(gameStages.indexOf('stage1_goals'));
                            }}
                        >
                            Start Game
                        </button>
                    </div>
                );

            case 'stage1_goals':
                const isGoalSelected = !!userProfile.goal;
                const isHomeBuyerSelected = userProfile.firstTimeHomeBuyer !== undefined;
                const canProceed = isGoalSelected && isHomeBuyerSelected;

                return (
                    <>
                        <h3 className={`text-xl font-semibold mb-6 ${headerTextColorClass}`}>1. What's your primary investment goal?</h3>
                        <div className="flex flex-col space-y-4 mb-8">
                            {['Home', 'Retirement', 'Flexible', 'Education'].map(goal => (
                                <button
                                    key={goal}
                                    className={`game-option-button ${optionButtonTextColorClass} ${userProfile.goal === goal ? optionButtonSelectedClass : optionButtonBgClass}`}
                                    onClick={() => handleGoalSelect(goal)}
                                >
                                    {goal === 'Home' && 'Save for a down payment on my first home.'}
                                    {goal === 'Retirement' && 'Save for retirement.'}
                                    {goal === 'Flexible' && 'Build general savings/wealth for flexible use.'}
                                    {goal === 'Education' && "Save for a child's education."}
                                </button>
                            ))}
                        </div>
                        <h3 className={`text-xl font-semibold mb-6 ${headerTextColorClass}`}>2. Are you a first-time home buyer in Canada?</h3>
                        <p className={`${sliderLabelColorClass} text-sm mb-4`}>{`(You haven't lived in a qualifying home as your principal residence in the current calendar year or the preceding four calendar years)`}</p>
                        <div className="flex space-x-4 justify-center">
                            <button
                                className={`game-option-button w-1/2 ${optionButtonTextColorClass} ${userProfile.firstTimeHomeBuyer === true ? optionButtonSelectedClass : optionButtonBgClass}`}
                                onClick={() => handleHomeBuyerSelect(true)}
                            >
                                Yes, I am.
                            </button>
                            <button
                                className={`game-option-button w-1/2 ${optionButtonTextColorClass} ${userProfile.firstTimeHomeBuyer === false ? optionButtonSelectedClass : optionButtonBgClass}`}
                                onClick={() => handleHomeBuyerSelect(false)}
                            >
                                No, I am not.
                            </button>
                        </div>
                        <div className="flex justify-end mt-8">
                            <button
                                id="next-stage-btn"
                                className={`${buttonBgClass} text-white py-2 px-6 rounded-lg shadow-md font-semibold transition-colors
                                    ${canProceed ? '' : 'opacity-50 cursor-not-allowed'}`}
                                onClick={goToNextStage}
                                disabled={!canProceed}
                            >
                                Next
                            </button>
                        </div>
                    </>
                );

            case 'stage2_risk_horizon':
                const riskValue = userProfile.riskTolerance || 5;
                const horizonValue = userProfile.timeHorizon || 5;

                return (
                    <>
                        <h3 className={`text-xl font-semibold mb-6 ${headerTextColorClass}`}>3. How comfortable are you with your investment's value going up and down (volatility)?</h3>
                        <input
                            type="range"
                            id="risk-slider"
                            min="1"
                            max="10"
                            value={riskValue}
                            className="mb-2 w-full custom-range-slider"
                            onChange={(e) => handleSliderChange('riskTolerance', e.target.value)}
                            style={{ '--track-color': sliderTrackColorClass, '--thumb-color': sliderThumbColorClass }}
                        />
                        <div className={`slider-label ${sliderLabelColorClass}`}>
                            <span>Low Risk (1)</span>
                            <span>High Risk (10)</span>
                        </div>
                        <p className={`${sliderLabelColorClass} text-sm mb-8 text-center`}>Comfort Level: {riskValue}</p>

                        <h3 className={`text-xl font-semibold mb-6 ${headerTextColorClass}`}>4. When do you plan to use this money?</h3>
                        <input
                            type="range"
                            id="horizon-slider"
                            min="1"
                            max="10"
                            value={horizonValue}
                            className="mb-2 w-full custom-range-slider"
                            onChange={(e) => handleSliderChange('timeHorizon', e.target.value)}
                            style={{ '--track-color': sliderTrackColorClass, '--thumb-color': sliderThumbColorClass }}
                        />
                        <div className={`slider-label ${sliderLabelColorClass}`}>
                            <span>Short-Term (1-3 years)</span>
                            <span>Long-Term (10+ years)</span>
                        </div>
                        <p className={`${sliderLabelColorClass} text-sm mb-8 text-center`}>Time Horizon: {horizonValue} years</p>
                        <div className="flex justify-between mt-8">
                            <button
                                className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-400 hover:bg-gray-500'} text-white py-2 px-6 rounded-lg shadow-md transition-colors font-semibold`}
                                onClick={goToPrevStage}
                            >
                                Back
                            </button>
                            <button
                                className={`${buttonBgClass} text-white py-2 px-6 rounded-lg shadow-md transition-colors font-semibold`}
                                onClick={goToNextStage}
                            >
                                Next
                            </button>
                        </div>
                    </>
                );

            case 'stage3_involvement':
                const involvementValue = userProfile.managementInvolvement || 5;

                return (
                    <>
                        <h3 className={`text-xl font-semibold mb-6 ${headerTextColorClass}`}>5. How much hands-on involvement do you want in managing your investments?</h3>
                        <input
                            type="range"
                            id="involvement-slider"
                            min="1"
                            max="10"
                            value={involvementValue}
                            className="mb-2 w-full custom-range-slider"
                            onChange={(e) => handleSliderChange('managementInvolvement', e.target.value)}
                            style={{ '--track-color': sliderTrackColorClass, '--thumb-color': sliderThumbColorClass }}
                        />
                        <div className={`slider-label ${sliderLabelColorClass}`}>
                            <span>Fully Managed (1)</span>
                            <span>Full Control (10)</span>
                        </div>
                        <p className={`${sliderLabelColorClass} text-sm mb-8 text-center`}>Involvement: {involvementValue}</p>
                        <div className="flex justify-between mt-8">
                            <button
                                className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-400 hover:bg-gray-500'} text-white py-2 px-6 rounded-lg shadow-md transition-colors font-semibold`}
                                onClick={goToPrevStage}
                            >
                                Back
                            </button>
                            <button
                                className={`${buttonBgClass} text-white py-2 px-6 rounded-lg shadow-md transition-colors font-semibold`}
                                onClick={goToNextStage}
                            >
                                See My Recommendation
                            </button>
                        </div>
                    </>
                );

            case 'results':
                const { accountRec, productRec, managementRec } = calculateRecommendation();

                return (
                    <div className="text-center">
                        <h3 className={`text-3xl font-bold mb-4 ${headerTextColorClass}`}>Your Personalized Investment Match!</h3>
                        <div id="user-profile-summary" className={`${summaryBgClass} p-6 rounded-lg text-left mb-6 border ${summaryBorderClass} shadow-inner`}>
                            <h4 className={`font-semibold text-lg ${summaryHeaderColorClass} mb-2`}>Your Profile:</h4>
                            <ul className={`list-disc list-inside ${summaryTextColorClass} space-y-1`}>
                                <li>Primary Goal: <span className={`font-medium ${summaryAccentColorClass}`}>{userProfile.goal}</span></li>
                                <li>Risk Tolerance: <span className={`font-medium ${summaryAccentColorClass}`}>{userProfile.riskTolerance} (Scale of 1-10)</span></li>
                                <li>Time Horizon: <span className={`font-medium ${summaryAccentColorClass}`}>{userProfile.timeHorizon} years</span></li>
                                <li>First-Time Home Buyer: <span className={`font-medium ${summaryAccentColorClass}`}>{userProfile.firstTimeHomeBuyer ? 'Yes' : 'No'}</span></li>
                                <li>Management Involvement: <span className={`font-medium ${summaryAccentColorClass}`}>{userProfile.managementInvolvement} (Scale of 1-10)</span></li>
                            </ul>
                        </div>
                        <div id="game-recommendation" className={`${recommendationBoxBgClass} border ${recommendationBoxBorderClass} rounded-lg text-left ${recommendationBoxTextColorClass} p-6 shadow-lg`}>
                            <h4 className={`font-bold text-xl mb-3 ${summaryHeaderColorClass}`}>Our Recommendation:</h4>
                            <p className="mb-2">For your primary goal, we recommend opening a **<span className={`${summaryAccentColorClass} font-semibold`}>{accountRec}</span>**.</p>
                            <p className="mb-2">Regarding the types of investments to put inside, we suggest: **<span className={`${summaryAccentColorClass} font-semibold`}>{productRec}</span>**</p>
                            <p>For managing your investments, we recommend considering: **<span className={`${summaryAccentColorClass} font-semibold`}>{managementRec}</span>**</p>
                            <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remember, this is a general recommendation. Always do your own research and consider consulting with a qualified financial advisor to ensure your choices align with your specific circumstances and goals.</p>
                        </div>
                        <button
                            id="play-again-btn"
                            className={`mt-8 ${buttonBgClass} text-white py-3 px-8 rounded-lg shadow-md transition-colors font-semibold text-lg`}
                            onClick={() => setCurrentStageIndex(gameStages.indexOf('start'))}
                        >
                            Play Again
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section id="investment-game" className={`content-section ${isActive ? 'active' : ''}`}>
            <div className="text-center mb-10 max-w-4xl mx-auto">
                <h2 className={`text-4xl font-extrabold ${headerTextColorClass} mb-4`}>Find Your Investment Match 🎮</h2>
                <p className={`${textBaseColorClass} text-lg`}>Answer a few questions to get a personalized recommendation on where to start your investment journey!</p>
            </div>
            <div className={`${sectionBgClass} p-8 rounded-lg shadow-xl ${sectionShadowClass} border ${sectionBorderClass} max-w-xl mx-auto`}>
                <div id="game-stage">
                    {renderStage()}
                </div>
            </div>
        </section>
    );
};


// Main App Component
function App() {
    const [activeTab, setActiveTab] = useState('accounts');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [modalType, setModalType] = useState('');
    const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

    useEffect(() => {
        // Check session storage for disclaimer acknowledgment on initial load
        if (sessionStorage.getItem('disclaimerAcknowledged') === 'true') {
            setDisclaimerAcknowledged(true);
        }
        // Load dark mode preference from session storage
        const storedDarkMode = sessionStorage.getItem('isDarkMode');
        if (storedDarkMode !== null) {
            setIsDarkMode(storedDarkMode === 'true');
        }
    }, []);

    useEffect(() => {
        // Save dark mode preference to session storage whenever it changes
        sessionStorage.setItem('isDarkMode', isDarkMode.toString());
        // Apply or remove light-mode class to body for global CSS overrides
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    }, [isDarkMode]);

    const handleAcknowledgeDisclaimer = () => {
        sessionStorage.setItem('disclaimerAcknowledged', 'true');
        setDisclaimerAcknowledged(true);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    const openModal = (data, type) => { // Defined here
        setModalContent(data);
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
        setModalType('');
    };

    // Determine header background style based on dark mode
    const headerBackgroundStyle = isDarkMode
        ? { background: 'linear-gradient(to right, #1A2235, #121827)' } // Dark blue-black gradient
        : { background: 'linear-gradient(to right, #E0F7FA, #FFFFFF)' }; // Light blue-white gradient


    const appBgClass = isDarkMode ? 'bg-gray-950' : 'bg-gray-100';
    const appTextColorClass = isDarkMode ? 'text-gray-100' : 'text-gray-800';
    // Removed headerBgClass from here, now using inline style for header
    const headerBorderClass = isDarkMode ? 'border-gray-800' : 'border-gray-200';
    const headerShadowClass = isDarkMode ? 'shadow-xl shadow-gray-900/30' : 'shadow-md shadow-gray-200/50';
    const navBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const navBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const navShadowClass = isDarkMode ? 'shadow-lg shadow-gray-900/20' : 'shadow-md shadow-gray-200/20';
    const footerBgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const footerBorderClass = isDarkMode ? 'border-gray-800' : 'border-gray-200';
    const footerTextColorClass = isDarkMode ? 'text-gray-500' : 'text-gray-600';

    return (
        <div className={`${appBgClass} ${appTextColorClass} min-h-screen flex flex-col font-inter relative`}>
            {/* Tailwind CSS CDN and custom styles */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 0;
                    transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
                }
                /* Default (Dark) theme for body and background effects */
                body {
                    background-color: #0A0A0A;
                    color: #E5E7EB;
                }
                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at top left, rgba(26, 34, 53, 0.1), transparent 50%),
                                radial-gradient(circle at bottom right, rgba(18, 24, 39, 0.1), transparent 50%);
                    transition: background 0.3s ease-in-out;
                    z-index: 0;
                }

                /* Light theme adjustments */
                body.light-mode {
                    background-color: #F9FAFB;
                    color: #374151;
                }
                body.light-mode::before {
                    background: radial-gradient(circle at top left, rgba(224, 247, 250, 0.5), transparent 50%),
                                radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.5), transparent 50%);
                }

                #main-app-content {
                    position: relative;
                    z-index: 10;
                }

                /* Header/Footer Styling */
                header {
                    padding: 2.5rem 0;
                }
                header h1 {
                    transition: color 0.3s ease-in-out;
                }
                header p {
                    transition: color 0.3s ease-in-out;
                }
                footer {
                    padding: 0.75rem 1rem;
                    margin-top: 3rem;
                }

                /* Navigation Tabs */
                nav {
                    padding: 0.5rem 0;
                    position: sticky;
                    top: 0;
                    z-index: 20;
                }
                nav ul {
                    flex-wrap: wrap;
                }
                nav button {
                    padding: 1rem 1.25rem;
                    border-radius: 0.5rem 0.5rem 0 0;
                    transition: all 0.3s ease-in-out;
                    white-space: nowrap;
                    font-weight: 500; /* Adjusted for better consistency */
                }
                /* Dark Mode Tab Styles */
                body:not(.light-mode) nav button {
                    color: #9CA3AF;
                }
                body:not(.light-mode) nav button:hover {
                    color: #E5E7EB;
                    background-color: #2D3748;
                }
                body:not(.light-mode) .tab-active {
                    border-bottom-color: #6366F1; /* Indigo for active */
                    color: #6366F1; /* Indigo for active text */
                    font-weight: 700;
                    background-color: #374151;
                }
                /* Light Mode Tab Styles */
                body.light-mode nav button {
                    color: #6B7280; /* Muted for inactive tabs */
                }
                body.light-mode nav button:hover {
                    color: #374151; /* Darker on hover */
                    background-color: #F3F4F6; /* Slight background on hover */
                }
                body.light-mode .tab-active {
                    border-bottom-color: #3B82F6; /* Vibrant blue for active */
                    color: #3B82F6; /* Vibrant blue for active text */
                    font-weight: 700;
                    background-color: #EBF8FF; /* Slightly lighter background for active */
                }


                /* General Content Section */
                .content-section {
                    display: none;
                    padding: 2rem 0;
                    animation: fadeIn 0.5s ease-out;
                }
                .content-section.active {
                    display: block;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Card Styles (Account & Product) */
                .account-card, .product-card {
                    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out;
                    cursor: pointer;
                    border-radius: 1rem;
                    overflow: hidden;
                    position: relative;
                }
                .account-card::before, .product-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                    z-index: 0;
                }
                .account-card:hover::before, .product-card:hover::before {
                    opacity: 1;
                }
                .account-card > *, .product-card > * {
                    position: relative;
                    z-index: 1;
                }

                /* Product Card Icon Hover Effect */
                .product-card span {
                    transition: transform 0.3s ease-in-out;
                }
                .product-card:hover span {
                    transform: scale(1.1);
                }

                /* Chart & Chart Buttons */
                .chart-container {
                    border-radius: 1rem;
                    padding: 1.5rem;
                    transition: background-color 0.3s ease-in-out;
                }
                .chart-toggle-btn {
                    border: none;
                    transition: all 0.3s ease-in-out;
                }
                .chart-toggle-btn:hover {
                    transform: translateY(-2px);
                }

                /* Table Styling (Comparison) */
                .comparison-table {
                    border-collapse: collapse;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    width: 100%;
                    font-size: 0.95rem;
                }
                .comparison-table th, .comparison-table td {
                    padding: 1rem;
                    text-align: left;
                    transition: all 0.3s ease-in-out;
                }
                .comparison-table th {
                    font-weight: 600;
                    font-size: 1.05rem;
                }
                .comparison-table tbody tr:hover td {
                    background-color: transparent; /* Reset by default */
                }

                /* Accordion Styles */
                .accordion-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.4s ease-in-out;
                }

                /* Glossary Section */
                #glossary-input {
                    transition: all 0.3s ease-in-out;
                }
                #explain-btn {
                    transition: all 0.3s ease-in-out;
                }
                #glossary-output {
                    transition: all 0.3s ease-in-out;
                }

                /* Game Specific Styles */
                .game-option-button {
                    border: 1px solid;
                    transition: all 0.2s ease-in-out;
                }
                .game-option-button:hover {
                    transform: translateY(-2px);
                }
                .game-option-button:active {
                    transform: translateY(0);
                }
                .custom-range-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 8px;
                    border-radius: 5px;
                    outline: none;
                    opacity: 0.9;
                    transition: opacity .2s;
                }
                .custom-range-slider:hover {
                    opacity: 1;
                }
                .custom-range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    border: 2px solid; /* Added border for contrast */
                }
                .custom-range-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    border: 2px solid; /* Added border for contrast */
                }
                .loading-spinner {
                    border: 4px solid #f3f3f3;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    vertical-align: middle;
                    margin-left: 8px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Modal specific styling */
                .modal-content {
                    transform: scale(0.95);
                    opacity: 0;
                    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                    max-height: 90vh; /* Limit modal height to 90% of viewport height */
                    overflow-y: auto; /* Enable vertical scrolling if content exceeds max-height */
                }
                .modal-content.show {
                    transform: scale(1);
                    opacity: 1;
                }

                /* Specific light/dark mode overrides for elements not easily controlled by props */
                body:not(.light-mode) .account-card, body:not(.light-mode) .product-card {
                    background: linear-gradient(135deg, #1F2937 0%, #2D3748 100%);
                    border: 1px solid #374151;
                }
                body.light-mode .account-card, body.light-mode .product-card {
                    background: linear-gradient(135deg, #F0F4F8 0%, #E2E6EC 100%);
                    border: 1px solid #CBD5E1;
                }
                body:not(.light-mode) .account-card::before, body:not(.light-mode) .product-card::before {
                    background: linear-gradient(45deg, rgba(99, 102, 241, 0.05) 0%, transparent 50%, rgba(99, 102, 241, 0.05) 100%); /* Indigo tint */
                }
                body.light-mode .account-card::before, body.light-mode .product-card::before {
                    background: linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0%, transparent 50%, rgba(59, 130, 246, 0.05) 100%);
                }

                body:not(.light-mode) .product-card span {
                    background-color: #1F2937; /* Darker bg for icon in dark mode */
                    border: 2px solid #374151;
                }
                body.light-mode .product-card span {
                    background-color: #E2E8F0; /* Lighter bg for icon in light mode */
                    border: 2px solid #CBD5E1;
                }


                body:not(.light-mode) .chart-toggle-btn.bg-indigo-600 {
                    background: linear-gradient(to right, #4F46E5, #6366F1); /* Indigo gradient */
                }
                body.light-mode .chart-toggle-btn.bg-blue-600 {
                    background: linear-gradient(to right, #3B82F6, #60A5FA);
                }
                body:not(.light-mode) .chart-toggle-btn.bg-gray-700 {
                    background: linear-gradient(to right, #4B5563, #6B7280);
                }
                body.light-mode .chart-toggle-btn.bg-gray-700 {
                    background: linear-gradient(to right, #D1D5DB, #E5E7EB);
                }

                body:not(.light-mode) .comparison-table th {
                    background-color: #1F2937;
                    border: 1px solid #374151;
                    color: #6366F1; /* Indigo for headers */
                }
                body.light-mode .comparison-table th {
                    background-color: #EBF8FF;
                    border: 1px solid #CBD5E1;
                    color: #3B82F6;
                }
                body:not(.light-mode) .comparison-table td {
                    background-color: #2D3748;
                    border: 1px solid #374151;
                    color: #E5E7EB;
                }
                body.light-mode .comparison-table td {
                    background-color: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    color: #374151;
                }
                body:not(.light-mode) .comparison-table tbody tr:nth-child(odd) td {
                    background-color: #1F2937;
                }
                body.light-mode .comparison-table tbody tr:nth-child(odd) td {
                    background-color: #F9FAFB;
                }
                body:not(.light-mode) .comparison-table tbody tr:hover td {
                    background-color: #374151;
                }
                body.light-mode .comparison-table tbody tr:hover td {
                    background-color: #F3F4F6;
                }

                /* Game specific selected button for dark/light mode */
                body:not(.light-mode) .game-option-button.selected-dark {
                    background: linear-gradient(to right, #4F46E5, #6366F1); /* Indigo gradient */
                    color: white;
                    border-color: #4F46E5;
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
                }
                body.light-mode .game-option-button.selected-light {
                    background: linear-gradient(to right, #3B82F6, #60A5FA);
                    color: white;
                    border-color: #3B82F6;
                    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
                }

                /* Slider styling - these need explicit setting per mode */
                .custom-range-slider {
                    background: var(--track-color);
                }
                .custom-range-slider::-webkit-slider-thumb {
                    background: var(--thumb-color);
                    border-color: var(--thumb-border-color);
                }
                .custom-range-slider::-moz-range-thumb {
                    background: var(--thumb-color);
                    border-color: var(--thumb-border-color);
                }
                body:not(.light-mode) .custom-range-slider {
                    --track-color: #374151;
                    --thumb-color: #6366F1; /* Indigo thumb */
                    --thumb-border-color: #E5E7EB;
                }
                body.light-mode .custom-range-slider {
                    --track-color: #CBD5E1;
                    --thumb-color: #3B82F6;
                    --thumb-border-color: #FFFFFF;
                }
                body:not(.light-mode) .loading-spinner {
                    border-top: 4px solid #6366F1; /* Indigo spinner */
                }
                body.light-mode .loading-spinner {
                    border-top: 4px solid #3B82F6;
                }
                `}
            </style>
            <script src="https://cdn.tailwindcss.com"></script>

            {!disclaimerAcknowledged && (
                <div id="disclaimer-modal" className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[1000]">
                    <div id="disclaimer-modal-content" className={`${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-indigo-500/20' : 'bg-white border-gray-200 shadow-blue-100/50'} p-10 rounded-lg shadow-2xl max-w-xl w-full text-center transition-all duration-300`}>
                        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-blue-700'} mb-6`}>Important Disclaimer</h2>
                        <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-8`}>This interactive guide provides general information about Canadian investment products and strategies for educational purposes only. It is not intended as financial advice. Investment involves risks, and past performance is not indicative of future results.</p>
                        <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-8`}>Always conduct your own research and consider consulting with a qualified financial advisor before making any investment decisions. Your individual financial situation, risk tolerance, and goals should always be taken into account.</p>
                        <button id="acknowledge-disclaimer" onClick={handleAcknowledgeDisclaimer} className={`${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-8 rounded-lg font-medium transition-colors`}>I Understand & Acknowledge</button>
                    </div>
                </div>
            )}

            <div id="main-app-content" className={`${disclaimerAcknowledged ? 'block' : 'hidden'} container mx-auto p-4 md:p-8 flex-grow`}>
                <header className={`rounded-lg shadow-xl ${headerShadowClass} mb-10 p-8`} style={headerBackgroundStyle}>
                    <div className="flex justify-between items-center mb-4">
                        <h1 className={`text-4xl md:text-5xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex-grow`}>Your Guide to Investing in Canada</h1>
                        <button
                            onClick={toggleDarkMode}
                            className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-indigo-700'} shadow-md transition-colors duration-300`}
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                // Sun icon to suggest switching to Light Mode
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.364l-1.591 1.591M21 12h-2.25m-.364 6.364l-1.591-1.591M12 21v-2.25m-6.364-.364l1.591-1.591M3 12H5.25m-.364-6.364l1.591 1.591M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                            ) : (
                                // Moon icon to suggest switching to Dark Mode
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0112 21.75c-3.617 0-6.945-1.847-8.86-4.732a9.718 9.718 0 0117.72-3.049z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>An interactive resource for newcomers.</p>
                </header>

                <nav className={`${navBgClass} border ${navBorderClass} mb-8 rounded-t-lg shadow-md ${navShadowClass}`}>
                    <ul className="flex flex-wrap -mb-px justify-center text-sm font-medium text-center">
                        <li className="mr-2">
                            <button className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'accounts' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('accounts')}>Account Types</button>
                        </li>
                        <li className="mr-2">
                            <button className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'compare' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('compare')}>Compare Accounts</button>
                        </li>
                        <li className="mr-2">
                            <button className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'how-to' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('how-to')}>How to Invest</button>
                        </li>
                        <li className="mr-2">
                            <button className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'products-deep-dive' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('products-deep-dive')}>Investment Products Deep Dive</button>
                        </li>
                        <li>
                            <button className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'considerations' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('considerations')}>Key Considerations</button>
                        </li>
                        <li>
                            <button className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'recommendation' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('recommendation')}>My Recommendation</button>
                        </li>
                        <li>
                            <button className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'glossary' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('glossary')}>Investment Glossary ✨</button>
                        </li>
                        <li>
                            <button className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'investment-game' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('investment-game')}>Investment Game 🎮</button>
                        </li>
                    </ul>
                </nav>

                <main>
                    {/* Pass openModal to AccountTypes and InvestmentProductsDeepDive */}
                    <AccountTypes openModal={openModal} isActive={activeTab === 'accounts'} isDarkMode={isDarkMode} />
                    <CompareAccounts isActive={activeTab === 'compare'} isDarkMode={isDarkMode} />
                    <HowToInvest isActive={activeTab === 'how-to'} isDarkMode={isDarkMode} />
                    <InvestmentProductsDeepDive openModal={openModal} isActive={activeTab === 'products-deep-dive'} isDarkMode={isDarkMode} />
                    <KeyConsiderations isActive={activeTab === 'considerations'} isDarkMode={isDarkMode} />
                    <MyRecommendation isActive={activeTab === 'recommendation'} isDarkMode={isDarkMode} />
                    <InvestmentGlossary isActive={activeTab === 'glossary'} isDarkMode={isDarkMode} />
                    <InvestmentGame isActive={activeTab === 'investment-game'} isDarkMode={isDarkMode} />
                </main>
            </div>

            <footer className={`${footerBgClass} ${footerTextColorClass} text-xs py-3 px-4 text-center mt-12 border-t ${footerBorderClass}`}>
                <div className="max-w-5xl mx-auto">
                    <p><strong>Disclaimer:</strong> This guide is for informational and educational purposes only and does not constitute financial advice. Investment involves risks, and past performance is not a guarantee of future results. Always consult with a qualified financial professional before making investment decisions.</p>
                </div>
            </footer>

            <Modal isOpen={isModalOpen} onClose={closeModal} data={modalContent} type={modalType} isDarkMode={isDarkMode} />
        </div>
    );
}

export default App;