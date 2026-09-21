import type { IvKey } from "./breeding.types"

const options: Array<[IvKey,string]> = [["hp","HP"],["atk","Attack"],["def","Defense"],["spatk","Sp. Attack"],["spdef","Sp. Defense"],["spe","Speed"]]

export function FormItemBreeding({ id, ivCount, value, onChange }: { id: string; ivCount: number; value: IvKey; onChange: (value: IvKey) => void }) {
  return <label htmlFor={id} className={`min-w-[190px] flex-1 ${ivCount === 0 ? "hidden" : ""}`}>
    <span className="mb-1 block text-sm text-mist-300"><strong className="mr-2 text-base text-white">{ivCount}</strong>1x31 IV in...</span>
    <select id={id} value={value} disabled={!ivCount} onChange={e => onChange(e.target.value as IvKey)} className="w-full rounded-md border border-white/20 bg-[#66707a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300">
      {options.map(([key,label]) => <option key={key} value={key}>{label}</option>)}
    </select>
  </label>
}
