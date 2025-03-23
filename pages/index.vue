<script setup lang="ts">
import type { BinanceFuturesExchangeInfo } from '~/types/type'
import { useCryptoData } from '~/pages/method'
import { UButton } from '#components'

const symbolList: BinanceFuturesExchangeInfo = await $fetch('https://fapi.binance.com/fapi/v1/exchangeInfo')

const symbolNameList = symbolList.symbols.filter(symbol => symbol.status === 'TRADING' && symbol.contractType === 'PERPETUAL' && symbol.marginAsset === 'USDT').map(symbol => symbol.symbol)
console.log(symbolNameList)

const { fetchMajorCryptos, fetchBtcAllTimeframes } = useCryptoData()

// 컴포지션 API를 사용하는 setup 함수 내부
const cryptoData = ref({})
const timeFrameData = ref({})
const currentTime = ref()
const sorting = ref([
  {
    id: 'symbol',
    desc: false,
  },
  {
    id: 'beforeAmount',
    desc: false,
  },
  {
    id: 'currentAmount',
    desc: false,
  },
])

const loadData = async () => {
  try {
    // 여러 암호화폐 데이터 로드

    const klineList = await fetchMajorCryptos(symbolNameList)
    console.log(klineList, klineList['BTCUSDT'][9][0])
    currentTime.value = klineList['BTCUSDT'][9][0]
    let data = []
    for (const symbol in klineList) {
      data = [...data, { symbol: symbol.replace('USDT', ''), beforeAmount: klineList[symbol][9][8], currentAmount: klineList[symbol][8][8] }]
      console.log(klineList[symbol])
    }
    cryptoData.value = data
    console.log(cryptoData.value)
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
        label: 'symbol',
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
        label: 'beforeAmount',
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
        label: 'currentAmount',
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
</script>

<template>
  <div>hello world</div>
  <div>불러온 시간 : {{ new Date(currentTime).toLocaleString() }}</div>
  <UTable
    v-model:sorting="sorting"
    :data="cryptoData"
    :columns="columns"
  />
</template>

<style scoped>

</style>
