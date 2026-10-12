import type {BannerProps} from "@/interface";
export default function Banner({title, description, className = ""}: BannerProps) {
 return <div className={`border-b border-gray-200 pb-5 ${className}`}>
  <p className="page-eyebrow mb-2">Tu espacio académico</p>
  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">{title}</h1>
  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{description}</p>
 </div>;
}
