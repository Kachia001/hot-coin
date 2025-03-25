<script setup lang="ts">
import type { BinanceFuturesExchangeInfo } from '~/types/type'
import { useCryptoData } from '~/pages/method'
import { UButton } from '#components'
import type { TableColumn, TableRow } from '#ui/components/Table.vue'

const symbolList: BinanceFuturesExchangeInfo = await $fetch('https://fapi.binance.com/fapi/v1/exchangeInfo')

const symbolNameList = symbolList.symbols
  .filter(symbol =>
    symbol.status === 'TRADING'
    && symbol.contractType === 'PERPETUAL'
    && symbol.marginAsset === 'USDT')
  .map(symbol => symbol.symbol)

const { fetchMajorCryptos } = useCryptoData()

const cryptoData = ref<(CryptoData | null)[]>([])
const currentTime = ref()
const sorting = ref([
  {
    id: 'currentAmount',
    desc: true,
  },
])

type CryptoData = { symbol: string, beforeAmount: number, currentAmount: number }

const loadData = async () => {
  try {
    const klineList = await fetchMajorCryptos(symbolNameList)
    currentTime.value = klineList['BTCUSDT'][9][0] // 가장 최근 데이터인 9번째 인덱스, 해당 인덱스의 시간인 0번째 인덱스, timeStamp
    let data: CryptoData[] = []
    for (const symbolName in klineList) {
      const symbol = symbolName.replace('USDT', '')
      const beforeAmount = klineList[symbolName][klineList[symbolName].length - 2][8]
      const currentAmount = klineList[symbolName][klineList[symbolName].length - 1][8]
      data = [...data, { symbol, beforeAmount, currentAmount }]
    }
    cryptoData.value = data.filter(cryptoData => (cryptoData?.beforeAmount !== 0 && cryptoData?.currentAmount !== 0))
  }
  catch (error) {
    console.error('데이터 로딩 오류:', error)
  }
}
await loadData()

const columns: TableColumn<CryptoData | null>[] = [
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
        class: '-mx-2.5 cursor-pointer',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) =>
      h('div', { class: 'cursor-pointer' }, row.getValue('symbol')),
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
        class: '-mx-2.5 cursor-pointer',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) =>
      h('div', { class: 'cursor-pointer' }, row.getValue('beforeAmount')),
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
        class: '-mx-2.5 cursor-pointer',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) =>
      h('div', { class: 'cursor-pointer' }, row.getValue('currentAmount')),
  },
]

const goBinance = (row: TableRow<CryptoData | null>) => {
  window.open(`https://www.binance.com/en/futures/${row.original?.symbol}USDT`, '_blank')
}
</script>

<template>
  <div>hello world</div>
  <div>불러온 시간 : {{ new Date(currentTime).toLocaleString() }}</div>
  <UTable
    v-model:sorting="sorting"
    class="w-1/2"
    :data="cryptoData"
    :columns="columns"
    @select="goBinance"
  />
</template>

<style scoped>

</style>
