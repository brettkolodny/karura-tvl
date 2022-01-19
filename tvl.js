const CoinGecko = require("coingecko-api");
const dexTvl = require("./dex-tvl");
const vaultTvl = require("./vault-tvl");
const stakingTvl = require("./staking-tvl");

const CoinGeckoClient = new CoinGecko();

async function getPrices(tokens) {
  try {
    const res = await CoinGeckoClient.simple.price({
      ids: Object.keys(tokens),
      vs_currencies: ["usd"],
    });

    if (res.success) {
      const prices = res.data;

      const totalTvl = Object.entries(prices)
        .map(([token, { usd: price }]) => {
          return tokens[token] * price;
        })
        .reduce((total, tokenPrice) => {
          return total + tokenPrice;
        }, 0);

      return totalTvl.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    }
  } catch (e) {
    console.error(e);
    return "ERROR";
  }
}

async function main() {
  const dexValues = await dexTvl.tvl();
  console.log(`${dexTvl.methodology}:\n`, await getPrices(dexValues));

  const vaultValues = await vaultTvl.tvl();
  console.log(`${vaultTvl.methodology}:\n`, await getPrices(vaultValues));

  const stakingValues = await stakingTvl.tvl();
  console.log(`${stakingTvl.methodology}:\n`, await getPrices(stakingValues));

  process.exit(0);
}

main();
