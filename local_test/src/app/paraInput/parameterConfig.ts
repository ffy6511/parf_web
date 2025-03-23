// 定义参数配置类型
export interface ParameterConfig {
  widening_delay: number;
  subdivide_non_linear: number;
  slevel: number;
  plevel: number;
  partition_history: number;
  min_loop_unroll: number;
  ilevel: number;
  equality_through_calls: string;
  auto_loop_unroll: number;
  domains: string[];
}

// 默认参数配置
export const defaultParameters: ParameterConfig = {
  widening_delay: 5,
  subdivide_non_linear: 7,
  slevel: 27,
  plevel: 92,
  partition_history: 0,
  min_loop_unroll: 0,
  ilevel: 43,
  equality_through_calls: 'none',
  auto_loop_unroll: 23,
  domains: ['cvalue', 'equality', 'octagon', 'symbolic-locations']
};

// 域选项
export const availableDomains = [
  'cvalue',
  'equality',
  'octagon',
  'symbolic-locations'
];

// equality_through_calls 选项
export const equalityOptions = [
  'none',
  'all'
];