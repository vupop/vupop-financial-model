// js/state.js

export const assumptions = {
    // Growth & User Metrics
    startingMAU: { 
        value: 10000, 
        note: 'Initial MAU at platform launch (Month 6)',
        min: 5000,
        max: 20000
    },
    year1TargetMAU: { 
        value: 50000, 
        note: 'Conservative target: 50K MAU (400% growth)',
        min: 30000,
        max: 75000
    },
    year2TargetMAU: { 
        value: 150000, 
        note: 'Conservative target: 150K MAU (200% growth)',
        min: 100000,
        max: 250000
    },
    year3TargetMAU: { 
        value: 313000, 
        note: 'Exit target: 313K MAU for £100M valuation',
        min: 250000,
        max: 500000
    },
    year4TargetMAU: { 
        value: 500000, 
        note: 'Growth target: 500K MAU for £160M+ valuation',
        min: 400000,
        max: 1000000
    },
    year5TargetMAU: { 
        value: 2000000, 
        note: 'Major platform target: 2M MAU for £638M valuation',
        min: 1000000,
        max: 5000000
    },

    // B2C Revenue Assumptions
    premiumSubscriptionPrice: { 
        value: 7.99, 
        note: 'Monthly price for premium B2C subscription',
        min: 4.99,
        max: 19.99
    },
    premiumAdoptionRate: { 
        value: 5, 
        note: 'Percentage of users who subscribe to premium',
        min: 1,
        max: 15
    },
    adRevenuePerUser: { 
        value: 0.50, 
        note: 'Monthly ad revenue per user (from Year 3)',
        min: 0.25,
        max: 2.00
    },
    affiliateCommissionRate: { 
        value: 20, 
        note: 'Percentage of revenue shared as affiliate commission',
        min: 10,
        max: 40
    },

    // B2B Revenue Assumptions
    socialTierPrice: { 
        value: 499, 
        note: 'Monthly price for B2B Social Tier',
        min: 299,
        max: 999
    },
    broadcastTierPrice: { 
        value: 1999, 
        note: 'Monthly price for B2B Broadcast Tier',
        min: 999,
        max: 3999
    },
    broadcastPlusTierPrice: { 
        value: 4999, 
        note: 'Monthly price for B2B Broadcast+ Tier',
        min: 2999,
        max: 9999
    },
    usageFeePerSecond: { 
        value: 0.01, 
        note: 'Fee per second of licensed broadcast content (B2B)',
        min: 0.005,
        max: 0.05
    },

    // Valuation Multipliers
    revenueMultiple: {
        value: 13.3,
        note: 'Base revenue multiple for valuation (Year 3)',
        min: 8,
        max: 20
    },
    strategicPremium: {
        value: 1.4,
        note: 'Strategic acquisition premium multiplier',
        min: 1.2,
        max: 1.6
    },
    sportsContentPremium: {
        value: 1.5,
        note: 'Premium for sports content focus',
        min: 1.2,
        max: 2.0
    },
    broadcastIntegrationPremium: {
        value: 2.0,
        note: 'Premium for broadcast integration capabilities',
        min: 1.5,
        max: 2.5
    }
};

export const fixedInputs = {
    b2bCustomers: {
        socialTier: [],
        broadcastTier: [],
        broadcastPlusTier: [],
    },
    secondsLicensed: [],
    costs: {
        cogs: {
            contentCreation: [],
            platformInfrastructure: [],
        },
        opex: {
            salaries: [],
            marketing: [],
            operations: [],
            technology: [],
        }
    }
};

export const state = {
    // Projections, KPIs, etc. will be stored here
    projections: {},
    kpis: {},
};

function parseValue(value) {
    if (typeof value !== 'string') return value;

    // Just clean the string and convert to a number.
    // Percentage conversion will be handled in the calculation logic.
    const cleaned = value.replace(/[£,%]/g, '').trim();
    const number = parseFloat(cleaned);

    return isNaN(number) ? value : number;
}

export function parseFinancialData(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const rows = doc.querySelectorAll('.waffle tbody tr');

    const assumptionMap = {
        'Starting MAU': 'startingMAU',
        'Year 1 Target MAU': 'year1TargetMAU',
        'Year 2 Target MAU': 'year2TargetMAU',
        'Year 3 Target MAU': 'year3TargetMAU',
        'Year 4 Target MAU': 'year4TargetMAU',
        'Year 5 Target MAU': 'year5TargetMAU',
        'Premium Subscription Price': 'premiumSubscriptionPrice',
        'Premium Adoption Rate': 'premiumAdoptionRate',
        'Ad Revenue per User': 'adRevenuePerUser',
        'Affiliate Commission Rate': 'affiliateCommissionRate',
        'Social Tier Price': 'socialTierPrice',
        'Broadcast Tier Price': 'broadcastTierPrice',
        'Broadcast+ Tier Price': 'broadcastPlusTierPrice',
        'Usage Fee per Second': 'usageFeePerSecond',
    };

    let mode = 'none'; // Will change to 'assumptions', 'b2b', 'cogs', 'opex'

    const yearlyDataMap = {
        'Social Tier Customers': fixedInputs.b2bCustomers.socialTier,
        'Broadcast Tier Customers': fixedInputs.b2bCustomers.broadcastTier,
        'Broadcast+ Tier Customers': fixedInputs.b2bCustomers.broadcastPlusTier,
        'Seconds Licensed (000s)': fixedInputs.secondsLicensed,
        'Content Creation & Processing': fixedInputs.costs.cogs.contentCreation,
        'Platform Infrastructure': fixedInputs.costs.cogs.platformInfrastructure,
        'Salaries & Benefits': fixedInputs.costs.opex.salaries,
        'Marketing & Growth': fixedInputs.costs.opex.marketing,
        'Operations & Legal': fixedInputs.costs.opex.operations,
        'Technology & Infrastructure': fixedInputs.costs.opex.technology,
    };

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;

        const firstCellText = cells[0].textContent.trim();

        // Update parsing mode based on section headers
        if (firstCellText.includes('1. KEY ASSUMPTIONS & INPUTS')) {
            mode = 'assumptions';
            return;
        }
        if (firstCellText.includes('2. REVENUE PROJECTIONS')) {
            mode = 'b2b'; // Start of B2B data
            return; 
        }
        if (firstCellText.includes('3. COST STRUCTURE')) {
            mode = 'costs'; // Start of Cost data
            return;
        }
        if (firstCellText.includes('4. PROFIT & LOSS SUMMARY')) {
            mode = 'none'; // End of relevant data
            return;
        }

        if (mode === 'assumptions') {
            const key = firstCellText;
            const mappedKey = assumptionMap[key];
            
            if (mappedKey && cells.length > 3) { 
                const rawValue = cells[1].textContent.trim();
                const note = cells[3].textContent.trim();
                
                if (rawValue) {
                    assumptions[mappedKey] = {
                        ...assumptions[mappedKey],
                        value: parseValue(rawValue),
                        note: note || '',
                    };
                }
            }
        } else if (mode === 'b2b' || mode === 'costs') {
            const targetArray = yearlyDataMap[firstCellText];
            if (targetArray && cells.length > 5) {
                for (let i = 1; i <= 5; i++) {
                    targetArray.push(parseValue(cells[i].textContent));
                }
            }
        }
    });

    console.log('Parsed Assumptions:', assumptions);
    console.log('Parsed Fixed Inputs:', fixedInputs);
} 