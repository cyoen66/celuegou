// @version=2

// 取过去20根K线的最高价，作为震荡区间上沿（阶段阻力位）
rangeHigh = highest(high, 20);

// 取过去20根K线的最低价，作为震荡区间下沿（阶段支撑位）
rangeLow = lowest(low, 20);

// 区间高度 = 上沿 - 下沿，后面用来计算目标位（亚当对称性）
rangeH = rangeHigh - rangeLow;

// 向上突破：当前K线收盘价站上阻力位，且上一根K线还在阻力位下方
// close > rangeHigh[1]  → 当前收盘突破了上一根计算出的阻力位
// close[1] <= rangeHigh[1] → 上一根收盘还没突破，确认是这根K线刚突破
breakUp = close > rangeHigh[1] && close[1] <= rangeHigh[1];

// 向下跌破：当前K线收盘价跌破支撑位，且上一根K线还在支撑位上方
// close < rangeLow[1]  → 当前收盘跌破了上一根计算出的支撑位
// close[1] >= rangeLow[1] → 上一根收盘还没跌破，确认是这根K线刚跌破
breakDown = close < rangeLow[1] && close[1] >= rangeLow[1];

// 最近5根K线内是否发生过向上突破
// [1]到[5]分别代表往前第1到第5根K线，用 || 连接，任意一根突破过就算true
// 用这个代替状态机，不需要 var 变量
recentBreakUp = breakUp[1] || breakUp[2] || breakUp[3] || breakUp[4] || breakUp[5];

// 最近5根K线内是否发生过向下跌破，逻辑同上
recentBreakDown = breakDown[1] || breakDown[2] || breakDown[3] || breakDown[4] || breakDown[5];

// 回踩做多确认，三个条件同时成立才触发：
// ① recentBreakUp         → 最近5根内发生过向上突破
// ② low <= rangeHigh[1] * 1.003 → 本根K线低点回踩到阻力位附近（允许0.3%误差）
// ③ close >= rangeHigh[1] * 0.997 → 本根K线收盘仍守在阻力位上方，没跌回区间内
retestLong = recentBreakUp && low <= rangeHigh[1] * 1.003 && close >= rangeHigh[1] * 0.997;

// 反抽做空确认，三个条件同时成立才触发：
// ① recentBreakDown        → 最近5根内发生过向下跌破
// ② high >= rangeLow[1] * 0.997 → 本根K线高点反抽到支撑位附近（允许0.3%误差）
// ③ close <= rangeLow[1] * 1.003 → 本根K线收盘仍压在支撑位下方，没收回区间内
retestShort = recentBreakDown && high >= rangeLow[1] * 0.997 && close <= rangeLow[1] * 1.003;

// 做多预警：回踩确认信号触发时推送通知，direction='buy' 表示买入方向
alertcondition(retestLong, title='做多信号', direction='buy')

// 做空预警：反抽确认信号触发时推送通知，direction='sell' 表示卖出方向
alertcondition(retestShort, title='做空信号', direction='sell')

// 做多箭头：retestLong 为 true 时在K线下方画绿色向上箭头
// refSeries=low  → 箭头锚定在当根K线的最低价位置
// placement='bottom' → 显示在K线下方
// fill=true → 箭头实心填充
plotShape(retestLong, title='做多入场', shape='arrowUp', color='green', refSeries=low, placement='bottom', fill=true)

// 做空箭头：retestShort 为 true 时在K线上方画红色向下箭头
// refSeries=high → 箭头锚定在当根K线的最高价位置
// placement='top' → 显示在K线上方
// fill=true → 箭头实心填充
plotShape(retestShort, title='做空入场', shape='arrowDown', color='red', refSeries=high, placement='top', fill=true)