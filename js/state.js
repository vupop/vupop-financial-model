// js/state.js

export const assumptions = {
    // User Growth
    startingMAU: 0,
    year1TargetMAU: 0,
    year2TargetMAU: 0,
    year3TargetMAU: 0,
    year4TargetMAU: 0,
    year5TargetMAU: 0,
    // B2C Pricing
    premiumSubscriptionPrice: 0,
    premiumAdoptionRate: 0,
    adRevenuePerUser: 0,
    affiliateCommissionRate: 0,
    // B2B Pricing
    socialTierPrice: 0,
    broadcastTierPrice: 0,
    broadcastPlusTierPrice: 0,
    usageFeePerSecond: 0,
    // B2B Customers (Year 1)
    initialSocialTierCustomers: 0,
    initialBroadcastTierCustomers: 0,
    initialBroadcastPlusTierCustomers: 0,
    initialSecondsLicensed: 0,
    // Costs (COGS)
    contentCreationProcessing: 0,
    platformInfrastructure: 0,
    // Costs (OpEx)
    salariesBenefits: 0,
    marketingGrowth: 0,
    operationsLegal: 0,
    technologyInfrastructure: 0,
};

export const state = {
    // Projections, KPIs, etc. will be stored here
    projections: {},
    kpis: {},
};

function parseValue(value) {
    if (typeof value !== 'string') return value;

    const isPercentage = value.includes('%');
    const cleaned = value.replace(/[£,%]/g, '').trim();
    let number = parseFloat(cleaned);

    if (isNaN(number)) {
        return value; // Return original string if not a number
    }

    if (isPercentage) {
        number /= 100;
    }

    return number;
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
        'Social Tier Customers': 'initialSocialTierCustomers',
        'Broadcast Tier Customers': 'initialBroadcastTierCustomers',
        'Broadcast+ Tier Customers': 'initialBroadcastPlusTierCustomers',
        'Seconds Licensed (000s)': 'initialSecondsLicensed',
        'Content Creation & Processing': 'contentCreationProcessing',
        'Platform Infrastructure': 'platformInfrastructure',
        'Salaries & Benefits': 'salariesBenefits',
        'Marketing & Growth': 'marketingGrowth',
        'Operations & Legal': 'operationsLegal',
        'Technology & Infrastructure': 'technologyInfrastructure',
    };

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 1) {
            const key = cells[0].textContent.trim();
            const mappedKey = assumptionMap[key];
            if (mappedKey) {
                const rawValue = cells[1].textContent;
                assumptions[mappedKey] = parseValue(rawValue);
            }
        }
    });

    console.log('Parsed Assumptions:', assumptions);
} 