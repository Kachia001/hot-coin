import type { BinanceFuturesKlinesParams, BinanceFuturesKlinesResponse } from '~/types/type'

export const useBatchKlinesApi = () => {
  /**
   * 여러 심볼에 대해 병렬로 klines API를 호출
   * @param symbols 심볼 배열 (예: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'])
   * @param commonParams 모든 API 호출에 공통으로 적용할 파라미터
   * @returns 각 심볼에 대한 응답 배열
   */
  const fetchKlinesParallel = async (
    symbols: string[],
    commonParams: Omit<BinanceFuturesKlinesParams, 'symbol'>,
  ): Promise<Record<string, BinanceFuturesKlinesResponse>> => {
    try {
      // 모든 API 호출을 병렬로 실행
      const promises = symbols.map((symbol) => {
        return useFetch<BinanceFuturesKlinesResponse>(
          'https://fapi.binance.com/fapi/v1/klines',
          {
            params: {
              symbol,
              ...commonParams,
            },
          },
        )
      })

      // 모든 Promise가 완료될 때까지 대기
      const results = await Promise.all(promises)

      // 결과를 심볼별로 매핑
      const resultMap: Record<string, BinanceFuturesKlinesResponse> = {}

      results.forEach((result, index) => {
        const symbol = symbols[index]
        if (result.error.value) {
          console.error(`Error fetching data for ${symbol}:`, result.error.value)
          resultMap[symbol] = []
        }
        else {
          resultMap[symbol] = result.data.value as BinanceFuturesKlinesResponse
        }
      })

      return resultMap
    }
    catch (err) {
      console.error('Error in batch API calls:', err)
      throw err
    }
  }

  /**
   * 여러 심볼에 대해 순차적으로 klines API를 호출 (API 레이트 리밋을 고려하여)
   * @param symbols 심볼 배열
   * @param commonParams 모든 API 호출에 공통으로 적용할 파라미터
   * @param delayMs 각 API 호출 사이의 지연 시간 (밀리초)
   * @returns 각 심볼에 대한 응답 배열
   */
  const fetchKlinesSequential = async (
    symbols: string[],
    commonParams: Omit<BinanceFuturesKlinesParams, 'symbol'>,
    delayMs = 100,
  ): Promise<Record<string, BinanceFuturesKlinesResponse>> => {
    const resultMap: Record<string, BinanceFuturesKlinesResponse> = {}

    // 각 심볼에 대해 순차적으로 API 호출
    for (const symbol of symbols) {
      try {
        const { data, error } = await useFetch<BinanceFuturesKlinesResponse>(
          'https://fapi.binance.com/fapi/v1/klines',
          {
            params: {
              symbol,
              ...commonParams,
            },
          },
        )

        if (error.value) {
          console.error(`Error fetching data for ${symbol}:`, error.value)
          resultMap[symbol] = []
        }
        else {
          resultMap[symbol] = data.value as BinanceFuturesKlinesResponse
        }

        // API 레이트 리밋을 고려하여 지연
        if (delayMs > 0 && symbols.indexOf(symbol) < symbols.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      }
      catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err)
        resultMap[symbol] = []
      }
    }

    return resultMap
  }

  /**
   * 여러 개의 기간에 대해 하나의 심볼 정보를 가져오는 함수
   * @param symbol 심볼 (예: 'BTCUSDT')
   * @param intervals 여러 간격 배열 (예: ['1m', '5m', '15m'])
   * @param otherParams 기타 공통 파라미터
   */
  const fetchMultipleIntervals = async (
    symbol: string,
    intervals: string[],
    otherParams: Omit<BinanceFuturesKlinesParams, 'symbol' | 'interval'>,
  ): Promise<Record<string, BinanceFuturesKlinesResponse>> => {
    try {
      const promises = intervals.map((interval) => {
        return useFetch<BinanceFuturesKlinesResponse>(
          'https://fapi.binance.com/fapi/v1/klines',
          {
            params: {
              symbol,
              interval,
              ...otherParams,
            },
          },
        )
      })

      const results = await Promise.all(promises)

      const resultMap: Record<string, BinanceFuturesKlinesResponse> = {}

      results.forEach((result, index) => {
        const interval = intervals[index]
        if (result.error.value) {
          console.error(`Error fetching ${interval} data for ${symbol}:`, result.error.value)
          resultMap[interval] = []
        }
        else {
          resultMap[interval] = result.data.value as BinanceFuturesKlinesResponse
        }
      })

      return resultMap
    }
    catch (err) {
      console.error('Error in multi-interval API calls:', err)
      throw err
    }
  }

  return {
    fetchKlinesParallel,
    fetchKlinesSequential,
    fetchMultipleIntervals,
  }
}

// 사용 예시
// composables/useCryptoData.ts
export const useCryptoData = () => {
  const { fetchKlinesParallel, fetchKlinesSequential, fetchMultipleIntervals } = useBatchKlinesApi()

  // 여러 주요 암호화폐의 데이터를 한꺼번에 가져오기
  const fetchMajorCryptos = async (symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT']) => {
    return await fetchKlinesParallel(symbols, {
      interval: '1m',
      limit: 10,
    })
  }

  // BTC의 여러 타임프레임 데이터 가져오기
  const fetchBtcAllTimeframes = async () => {
    const intervals = ['1m', '5m', '15m', '1h', '4h', '1d']

    return await fetchMultipleIntervals('BTCUSDT', intervals, {
      limit: 10,
    })
  }

  return {
    fetchMajorCryptos,
    fetchBtcAllTimeframes,
  }
}
