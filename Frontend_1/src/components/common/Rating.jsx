import { Star } from 'lucide-react';
export default function Rating({ value = 0, count }) { return <span className="inline-flex items-center gap-1 text-sm text-gray-600"><Star size={14} className="fill-amber-400 text-amber-400" />{Number(value).toFixed(1)}{count !== undefined && <span className="text-gray-400">({count})</span>}</span>; }
