// @version=2

// ── 区间计算 ──────────────────────────────────────────────
// 取过去20根K线最高价作为阶段阻力位（区间上沿）
rangeHigh = highest(high, 20);

// 取过去20根K线最低价作为阶段支撑位（区间下沿）
rangeLow = lowest(low, 20);

// 区间高度，亚当理论对称性目标位的核心计算依据
rangeH = rangeHigh - rangeLow;

// ── 亚当理论目标位（对称性：区间高度等距复制到突破方向）──
// 做多目标 = 突破位 + 区间高度（文档公式：A + H）
longTarget = rangeHigh[1] + rangeH[1];

// 做空目标 = 跌破位 - 区间高度（文档公式：B - H）
shortTarget = rangeLow[1] - rangeH[1];

// ── 突破检测（手动实现，不用crossover）───────────────────
// 向上突破：当前收盘站上阻力位，且上一根还在阻力位下方
breakUp = close > rangeHigh[1] && close[1] <= rangeHigh[1];

// 向下跌破：当前收盘跌破支撑位，且上一根还在支撑位上方
breakDown = close < rangeLow[1] && close[1] >= rangeLow[1];

// ── 最近5根内是否发生过突破（替代var状态机）─────────────
// 用[1]到[5]的||连接，任意一根发生过突破就返回true
recentBreakUp   = breakUp[1]   || breakUp[2]   || breakUp[3]   || breakUp[4]   || breakUp[5];
recentBreakDown = breakDown[1] || breakDown[2] || breakDown[3] || breakDown[4] || breakDown[5];

// ── 回踩做多确认（三个条件缺一不可）─────────────────────
// ① 最近5根内发生过向上突破
// ② 本根K线低点回踩到阻力位附近（0.3%容忍带）
// ③ 本根K线收盘守在阻力位上方，没跌回区间内
retestLong = recentBreakUp && low <= rangeHigh[1] * 1.003 && close >= rangeHigh[1] * 0.997;

// ── 反抽做空确认（三个条件缺一不可）─────────────────────
// ① 最近5根内发生过向下跌破
// ② 本根K线高点反抽到支撑位附近（0.3%容忍带）
// ③ 本根K线收盘压在支撑位下方，没收回区间内
retestShort = recentBreakDown && high >= rangeLow[1] * 0.997 && close <= rangeLow[1] * 1.003;

// ── 止损信号（假突破识别）────────────────────────────────
// 文档逻辑：回踩后价格重新跌回区间内 = 假突破 = 止损
// 最近3根内出现过做多入场，但当前收盘重新跌回阻力位下方
stopLong  = (retestLong[1] || retestLong[2] || retestLong[3])  && close < rangeHigh[1] * 0.997;

// 最近3根内出现过做空入场，但当前收盘重新站回支撑位上方
stopShort = (retestShort[1] || retestShort[2] || retestShort[3]) && close > rangeLow[1]  * 1.003;

// ── 到达目标位信号 ────────────────────────────────────────
// 做多入场后，价格高点触达目标位 = 考虑止盈
hitLongTarget  = (retestLong[1]  || retestLong[2]  || retestLong[3]  || retestLong[4]  || retestLong[5])  && high >= longTarget;

// 做空入场后，价格低点触达目标位 = 考虑止盈
hitShortTarget = (retestShort[1] || retestShort[2] || retestShort[3] || retestShort[4] || retestShort[5]) && low  <= shortTarget;

// ── 警报 ──────────────────────────────────────────────────
alertcondition(retestLong,    title='做多入场信号', direction='buy');
alertcondition(retestShort,   title='做空入场信号', direction='sell');
alertcondition(stopLong,      title='多头止损信号', direction='sell');
alertcondition(stopShort,     title='空头止损信号', direction='buy');
alertcondition(hitLongTarget, title='多头目标到达', direction='sell');
alertcondition(hitShortTarget,title='空头目标到达', direction='buy');

// ── 入场箭头 ──────────────────────────────────────────────
// 做多入场：K线下方绿色向上箭头
plotShape(retestLong,  title='做多入场', shape='arrowUp',   color='green', refSeries=low,        placement='bottom', fill=true);

// 做空入场：K线上方红色向下箭头
plotShape(retestShort, title='做空入场', shape='arrowDown', color='red',   refSeries=high,       placement='top',    fill=true);

// ── 止损信号 ──────────────────────────────────────────────
// 假突破止损：K线上方橙色向下箭头（多头假突破，应离场）
plotShape(stopLong,    title='多头止损', shape='arrowDown', color='orange', refSeries=high,      placement='top',    fill=true);

// 假跌破止损：K线下方橙色向上箭头（空头假跌破，应离场）
plotShape(stopShort,   title='空头止损', shape='arrowUp',   color='orange', refSeries=low,       placement='bottom', fill=true);

// ── 目标位到达信号 ────────────────────────────────────────
// 多头目标到达：在目标价位附近显示黄色菱形标记
plotShape(hitLongTarget,  title='多头目标', shape='circle', color='yellow', refSeries=longTarget,  placement='top',    fill=true);

// 空头目标到达：在目标价位附近显示黄色菱形标记
plotShape(hitShortTarget, title='空头目标', shape='circle', color='yellow', refSeries=shortTarget, placement='bottom', fill=true);