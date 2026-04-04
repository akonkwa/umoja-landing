# Diesel Generator Cost-Benefit Analysis

## Reference system from the proposal

- Facility: HOPE for Women Health Center, Monrovia, Liberia
- Base energy system in proposal: `42 kWp` solar PV + `261 kWh` usable battery
- Base EPC price: `$180,700`
- Revised total including automated cleaning: `$213,700`

Source values above were taken from the matching project workbook:
- `Commercial`: base EPC `$180,700`, cleaning add-on `$33,000`, revised total `$213,700`
- `Summary`: `42 kWp` PV, `261 kWh` usable battery, `90` modules

## Diesel-equivalent interpretation

To provide a practical diesel equivalent for the same critical-load application, this note assumes:

- A diesel generator sized around `60-80 kVA` prime-rated, with ATS, acoustic canopy, controls, distribution integration, and day tank
- If hospital-grade redundancy is required, a more realistic configuration is `N+1` redundancy with two smaller units or one prime unit plus one backup unit
- Annual electricity service offset by the solar system is approximately `55,000 kWh/year`
- Generator fuel intensity is approximately `0.30 liters/kWh`
- Diesel price in Liberia is assumed at approximately `$0.98/liter`
- Diesel routine O&M is modeled at `$3,500/year`
- Solar system O&M is modeled at `$3,000/year`

## Annual operating cost of diesel option

- Annual diesel fuel use:
  - `55,000 kWh/year x 0.30 L/kWh = 16,500 liters/year`
- Annual fuel cost:
  - `16,500 L x $0.976/L = $16,104/year`
- Routine O&M:
  - `$3,500/year`
- Total diesel operating cost:
  - about `$19,604/year`

## Capex scenarios for diesel alternative

Three practical diesel scenarios are useful:

1. Low case: single basic genset package
   - Approximate installed capex: `$30,000`
2. Mid case: stronger installation allowance
   - Approximate installed capex: `$40,000`
3. Reliability case: hospital-oriented redundancy / larger package
   - Approximate installed capex: `$70,000`

## 10-year total cost of ownership

Assuming diesel O&M above and solar O&M of `$3,000/year`:

- Solar + battery + cleaning:
  - `$213,700 + (10 x $3,000) = $243,700`
- Solar + battery only:
  - `$180,700 + (10 x $3,000) = $210,700`
- Diesel low case:
  - `$30,000 + (10 x $19,604) = $226,040`
- Diesel mid case:
  - `$40,000 + (10 x $19,604) = $236,040`
- Diesel reliability case:
  - `$70,000 + (10 x $19,604) = $266,040`

Interpretation:

- Against the revised project total including cleaning, diesel is still cheaper at 10 years only in the low and mid cases, but the gap is no longer large once operating cost is included
- Against the base solar + battery system, diesel is already more expensive by year 10 in all but the very lowest-capex interpretation
- The 10-year result is highly sensitive to diesel price escalation, generator loading, logistics, and overhaul costs

## 15-year total cost of ownership

- Solar + battery + cleaning:
  - `$213,700 + (15 x $3,000) = $258,700`
- Solar + battery only:
  - `$180,700 + (15 x $3,000) = $225,700`
- Diesel low case:
  - `$30,000 + (15 x $19,604) = $324,060`
- Diesel mid case:
  - `$40,000 + (15 x $19,604) = $334,060`
- Diesel reliability case:
  - `$70,000 + (15 x $19,604) = $364,060`

Interpretation:

- By year 15, the solar + battery option is clearly lower-cost than diesel in all three cases
- The revised package including cleaning is about `$65,360` cheaper than the low-capex diesel case over 15 years
- The base solar + battery system is about `$98,360` cheaper than the low-capex diesel case over 15 years

## Simple payback view

- Incremental cost of revised solar package versus low-case diesel:
  - `$213,700 - $30,000 = $183,700`
- Net annual operating savings versus diesel:
  - about `$19,604 - $3,000 = $16,604/year`
- Simple payback:
  - about `11.1 years`

For the base solar + battery scope without cleaning:

- Incremental cost versus low-case diesel:
  - `$180,700 - $30,000 = $150,700`
- Simple payback:
  - about `9.1 years`

## Non-financial benefits of solar + battery over diesel

- Better power quality for imaging, lab, cold-chain, and sterilization loads
- Lower risk of outage due to fuel shortages or delayed deliveries
- Lower noise, vibration, and exhaust exposure in a clinical environment
- Lower maintenance dependency on moving mechanical equipment
- The battery provides ride-through and short-term autonomy that a simple genset does not replicate without continuous fuel availability and start reliability
- Avoided emissions are about `39.8 tCO2/year` at the assumed diesel usage

## Main caveats

- This is a screening-level analysis, not a vendor quote
- A true hospital-equivalent diesel design may need redundancy, larger storage tanks, fire protection, and higher installation cost than the low-case scenario
- If actual diesel price rises above the assumed level, the solar option becomes favorable sooner
- If the actual annual served load is above `55,000 kWh/year`, diesel becomes materially more expensive
- Major generator overhauls are not separately modeled here; including them would strengthen the solar case

## External reference points used for assumptions

- Liberia diesel price reference used for this note: approximately `$0.99/liter` in March 2026
- Generator fuel-burn reasonableness check: a published 60 kW diesel generator datasheet shows `19 L/hr` at `100%` prime load and `17 L/hr` at `75%` prime load, so the `0.30 L/kWh` assumption used here is not aggressive against diesel

## Bottom line

If the question is short-term capex only, a diesel generator solution is cheaper upfront.

If the question is life-cycle cost and reliability for healthcare operations, the proposed solar + battery system is the stronger long-term choice, and it becomes clearly more economical on a 15-year view. The cleaning add-on lengthens payback modestly, but it also protects delivered solar yield and reduces manual roof-cleaning risk.
