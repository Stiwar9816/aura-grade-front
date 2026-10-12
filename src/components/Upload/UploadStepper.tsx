import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";

interface Step {
 id: number;
 title: string;
 description: string;
 icon?: React.ReactNode;
}
interface UploadStepperProps {
 steps: Step[];
 currentStep: number;
 progressPercent?: number;
 progressLabel?: string;
 progressDescription?: string;
}

export default function UploadStepper({steps, currentStep, progressPercent, progressLabel, progressDescription}: UploadStepperProps) {
 const percentage = progressPercent == null ? undefined : Math.max(0, Math.min(100, progressPercent));
 return (
  <section aria-label="Estado de la entrega" className="card p-4 sm:p-5">
   <div className="flex items-center justify-between gap-4">
    <h2 className="text-base font-semibold text-gray-900">Estado de la entrega</h2>
    <span className="text-sm font-semibold tabular-nums text-electric-700">{percentage === undefined ? "En curso" : `${percentage}%`}</span>
   </div>
   {percentage !== undefined && (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label="Procesamiento de la entrega" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
     <div className="h-full bg-electric-500 transition-all" style={{width: `${percentage}%`}} />
    </div>
   )}
   <ol className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
    {steps.map(step => {
     const done = step.id < currentStep || percentage === 100;
     const active = step.id === currentStep && !done;
     return (
      <li key={step.id} aria-current={active ? "step" : undefined} className="min-w-0">
       <div className="flex items-start gap-2">
        <span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${done || active ? "bg-electric-500 text-white" : "bg-gray-100 text-gray-600"}`}>
         {done ? <FontAwesomeIcon icon={faCheck} /> : step.id}
        </span>
        <span className={`text-sm ${active ? "font-semibold text-electric-700" : "text-gray-600"}`}>
         {step.title}<span className="sr-only">{done ? ", completado" : active ? ", en curso" : ", pendiente"}</span>
        </span>
       </div>
      </li>
     );
    })}
   </ol>
   {(progressLabel || progressDescription) && (
    <div className="mt-5 border-t border-gray-200 pt-4" role="status">
     <p className="text-sm font-medium text-gray-900">{progressLabel}</p>
     <p className="mt-1 text-sm text-gray-600">{progressDescription}</p>
    </div>
   )}
  </section>
 );
}
