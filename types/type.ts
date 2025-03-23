export interface BinanceFuturesExchangeInfo {
  exchangeFilters: never[]
  rateLimits: RateLimit[]
  serverTime: number
  assets: Asset[]
  symbols: Symbol[]
  timezone: string
}

export interface RateLimit {
  interval: string
  intervalNum: number
  limit: number
  rateLimitType: string
}

export interface Asset {
  asset: string
  marginAvailable: boolean
  autoAssetExchange: string | null
}

export interface Symbol {
  symbol: string
  pair: string
  contractType: string
  deliveryDate: number
  onboardDate: number
  status: string
  maintMarginPercent: string
  requiredMarginPercent: string
  baseAsset: string
  quoteAsset: string
  marginAsset: string
  pricePrecision: number
  quantityPrecision: number
  baseAssetPrecision: number
  quotePrecision: number
  underlyingType: string
  underlyingSubType: string[]
  settlePlan: number
  triggerProtect: string
  liquidationFee: string
  marketTakeBound: string
  filters: Filter[]
  orderTypes: string[]
  timeInForce: string[]
}

export interface Filter {
  filterType: string
  maxPrice?: string
  minPrice?: string
  tickSize?: string
  maxQty?: string
  minQty?: string
  stepSize?: string
  limit?: number
  notional?: string
  multiplierDown?: string
  multiplierUp?: string
  multiplierDecimal?: string
}

// types/binance-klines.ts

// K라인(캔들) 데이터 타입
// Binance API는 배열 형태로 K라인 데이터를 반환합니다
export type BinanceFuturesKlineData = [
  number, // 0. 캔들 시작 시간 (Open time)
  string, // 1. 시가 (Open price)
  string, // 2. 고가 (High price)
  string, // 3. 저가 (Low price)
  string, // 4. 종가 (Close price)
  string, // 5. 거래량 (Volume)
  number, // 6. 캔들 종료 시간 (Close time)
  string, // 7. 거래대금 (Quote asset volume)
  number, // 8. 거래 횟수 (Number of trades)
  string, // 9. 매수 거래량 (Taker buy base asset volume)
  string, // 10. 매수 거래대금 (Taker buy quote asset volume)
  string, // 11. 사용하지 않음 (Ignore)
]

// 응답 타입 (배열 형태로 반환됨)
export type BinanceFuturesKlinesResponse = BinanceFuturesKlineData[]

// 요청 파라미터 인터페이스
export interface BinanceFuturesKlinesParams {
  symbol: string // 심볼 (예: 'BTCUSDT')
  interval: string // 간격 (예: '1m', '5m', '1h', '1d' 등)
  startTime?: number // 시작 시간 (밀리초 타임스탬프)
  endTime?: number // 종료 시간 (밀리초 타임스탬프)
  limit?: number // 반환할 캔들 개수 (기본값: 500, 최대: 1500)
}
