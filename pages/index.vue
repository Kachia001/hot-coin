<script setup lang="ts">
import type { BinanceFuturesExchangeInfo } from '~/types/type'
import { useCryptoData } from '~/pages/method'
import { UButton } from '#components'

const symbolList: BinanceFuturesExchangeInfo = await $fetch('https://fapi.binance.com/fapi/v1/exchangeInfo')

const symbolNameList = symbolList.symbols.filter(symbol => symbol.status === 'TRADING' && symbol.contractType === 'PERPETUAL' && symbol.marginAsset === 'USDT').map(symbol => symbol.symbol)

const { fetchMajorCryptos, fetchBtcAllTimeframes } = useCryptoData()

// 컴포지션 API를 사용하는 setup 함수 내부
const cryptoData = ref([])
const timeFrameData = ref({})
const currentTime = ref()
const sorting = ref([
  {
    id: 'currentAmount',
    desc: true,
  },
])

const loadData = async () => {
  try {
    // 여러 암호화폐 데이터 로드

    const klineList = await fetchMajorCryptos(symbolNameList)

    currentTime.value = klineList['BTCUSDT'][9][0]
    let data = []
    for (const symbol in klineList) {
      data = [...data, { symbol: symbol.replace('USDT', ''), beforeAmount: parseFloat(klineList[symbol][klineList[symbol].length - 2][8]), currentAmount: parseFloat(klineList[symbol][klineList[symbol].length - 1][8]) }]
    }
    cryptoData.value = data

    // BTC의 여러 타임프레임 데이터 로드
    // timeFrameData.value = await fetchBtcAllTimeframes()
  }
  catch (error) {
    console.error('데이터 로딩 오류:', error)
  }
}
await loadData()

const columns = [
  {
    accessorKey: 'symbol',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Symbol',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
  },
  {
    accessorKey: 'beforeAmount',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Before Trade Count',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
  },
  {
    accessorKey: 'currentAmount',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Current Trade Count',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
  },

]

const goBinance = (row) => {
  window.open(`https://www.binance.com/en/futures/${row.original.symbol}USDT`, '_blank')
}
</script>

<template>
  <div>hello world</div>
  <div>불러온 시간 : {{ new Date(currentTime).toLocaleString() }}</div>
  <UTable
    v-model:sorting="sorting"
    class="w-1/2"
    :data="cryptoData.filter((data) => (data.beforeAmount !== 0 && data.currentAmount !== 0)).sort((data) => data)"
    :columns="columns"
    @select="goBinance"
  />
</template>

<style scoped>

</style>
