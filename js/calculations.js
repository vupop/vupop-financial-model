// Constants from documentation
const VALUATION_MULTIPLIERS = {
    BASE_MAU_VALUE: 76, // Median market value per MAU
    SPORTS_CONTENT_PREMIUM: 1.5, // Sports content drives higher engagement
    BROADCAST_INTEGRATION: 2.0, // Unique licensing model creates defensible IP
    B2B_REVENUE_MODEL: 1.2, // Diversified revenue streams reduce risk
    STRATEGIC_PREMIUM: 1.4 // Average strategic premium for content synergies
};

// Revenue model components from documentation
const REVENUE_COMPONENTS = {
    BROADCAST_LICENSING: 0.40, // 40% of revenue
    SAAS_SUBSCRIPTIONS: 0.30, // 30% of revenue
    AFFILIATE_COMMISSIONS: 0.20, // 20% of revenue
    PREMIUM_FEATURES: 0.10 // 10% of revenue
};

// Growth trajectory benchmarks from documentation
const GROWTH_BENCHMARKS = {
    EARLY_STAGE: {
        PEAK_MOM_GROWTH: 0.25, // 25% month-over-month during peak seasons
        OFF_SEASON_MOM_GROWTH: 0.15 // 15% during off-seasons
    },
    GROWTH_STAGE: {
        PEAK_MOM_GROWTH: 0.15, // 15% month-over-month during peak seasons
        OFF_SEASON_MOM_GROWTH: 0.08 // 8% during off-seasons
    },
    MATURE: {
        PEAK_MOM_GROWTH: 0.08, // 8% month-over-month during peak seasons
        OFF_SEASON_MOM_GROWTH: 0.03 // 3% during off-seasons
    }
};

// Exit valuation multiples by year
const EXIT_MULTIPLES = {
    YEAR_3: 15, // Primary exit window (313K MAU)
    YEAR_4: 10, // Secondary exit window (500K+ MAU)
    YEAR_5: 8  // Extended growth scenario
};

export function calculateProjections(assumptions, fixedInputs) {
    const yearlyProjections = [];
    const mauTargets = [
        assumptions.year1TargetMAU.value,
        assumptions.year2TargetMAU.value,
        assumptions.year3TargetMAU.value,
        assumptions.year4TargetMAU.value,
        assumptions.year5TargetMAU.value,
    ];

    let currentMAU = assumptions.startingMAU.value;

    for (let i = 0; i < 5; i++) {
        const year = i + 1;
        const targetMAU = mauTargets[i];
        
        // Calculate average MAU for the year
        const averageMAU = (currentMAU + targetMAU) / 2;

        // Calculate revenue components
        const revenueBreakdown = calculateRevenueBreakdown(averageMAU, assumptions);
        
        // Calculate costs
        const costs = calculateCosts(year, fixedInputs);
        
        // Calculate profitability
        const profitability = calculateProfitability(revenueBreakdown.total, costs);
        
        // Calculate valuation
        const valuation = calculateValuation(targetMAU, revenueBreakdown.total, year);

        yearlyProjections.push({
            year,
            mau: targetMAU,
            revenue: revenueBreakdown,
            costs,
            profitability,
            valuation
        });

        currentMAU = targetMAU;
    }

    return { yearly: yearlyProjections };
}

function calculateRevenueBreakdown(mau, assumptions) {
    // B2C Revenue
    const premiumSubsRevenue = mau * (assumptions.premiumAdoptionRate.value / 100) * 
        assumptions.premiumSubscriptionPrice.value * 12;
    
    const adRevenue = mau * assumptions.adRevenuePerUser.value * 12;
    
    const affiliateRevenue = premiumSubsRevenue * (assumptions.affiliateCommissionRate.value / 100);

    const totalB2CRevenue = premiumSubsRevenue + adRevenue + affiliateRevenue;

    // B2B Revenue
    const socialTierRevenue = assumptions.socialTierPrice.value * 12;
    const broadcastTierRevenue = assumptions.broadcastTierPrice.value * 12;
    const broadcastPlusTierRevenue = assumptions.broadcastPlusTierPrice.value * 12;
    const usageFeeRevenue = assumptions.usageFeePerSecond.value * 1000;

    const totalB2BRevenue = socialTierRevenue + broadcastTierRevenue + 
        broadcastPlusTierRevenue + usageFeeRevenue;

    const totalRevenue = totalB2CRevenue + totalB2BRevenue;

    return {
        premiumSubscriptions: premiumSubsRevenue,
        adRevenue,
        affiliateRevenue,
        totalB2C: totalB2CRevenue,
        socialTier: socialTierRevenue,
        broadcastTier: broadcastTierRevenue,
        broadcastPlusTier: broadcastPlusTierRevenue,
        usageFees: usageFeeRevenue,
        totalB2B: totalB2BRevenue,
        total: totalRevenue
    };
}

function calculateCosts(year, fixedInputs) {
    const cogsContent = fixedInputs.costs.cogs.contentCreation[year - 1] || 0;
    const cogsInfra = fixedInputs.costs.cogs.platformInfrastructure[year - 1] || 0;
    const opExSalaries = fixedInputs.costs.opex.salaries[year - 1] || 0;
    const opExMarketing = fixedInputs.costs.opex.marketing[year - 1] || 0;
    const opExOps = fixedInputs.costs.opex.operations[year - 1] || 0;
    const opExTech = fixedInputs.costs.opex.technology[year - 1] || 0;

    return {
        totalCOGS: cogsContent + cogsInfra,
        totalOpEx: opExSalaries + opExMarketing + opExOps + opExTech
    };
}

function calculateProfitability(totalRevenue, costs) {
    const grossProfit = totalRevenue - costs.totalCOGS;
    const ebitda = grossProfit - costs.totalOpEx;
    const grossMargin = totalRevenue ? (grossProfit / totalRevenue) * 100 : 0;

    return {
        grossProfit,
        ebitda,
        grossMargin
    };
}

export function calculateValuation(mau, revenue, year) {
    // Custom logic for launch and end of year 1
    if (year === 1) return 9000000; // Launch valuation: £9M
    if (year === 2) return 15000000; // End of year 1: £15M

    // Calculate MAU-based valuation
    const totalMultiplier = Object.values(VALUATION_MULTIPLIERS).reduce((a, b) => a * b, 1);
    const valuePerMAU = VALUATION_MULTIPLIERS.BASE_MAU_VALUE * totalMultiplier;
    const mauValuation = mau * valuePerMAU;
    
    // Calculate revenue-based valuation
    const revenueMultiple = EXIT_MULTIPLES[`YEAR_${year}`] || 13.3; // Default to 13.3x if not in exit window
    const revenueValuation = revenue * revenueMultiple;
    
    // Return the higher of the two valuations
    return Math.max(mauValuation, revenueValuation);
}

export function calculateGrowthRate(currentMAU, stage) {
    const benchmark = GROWTH_BENCHMARKS[stage];
    // Determine if we're in peak season (Q4)
    const isPeakSeason = new Date().getMonth() >= 8 && new Date().getMonth() <= 11;
    return isPeakSeason ? benchmark.PEAK_MOM_GROWTH : benchmark.OFF_SEASON_MOM_GROWTH;
} 