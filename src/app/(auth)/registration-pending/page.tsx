"use client";

import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faBuildingColumns,
	faClock,
	faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {AuthLayout} from "@/components/Auth";

export default function RegistrationPendingPage() {
	return (
		<AuthLayout
			title="Registro recibido"
			subtitle="Tu institución debe validar tu cuenta antes del primer ingreso"
		>
			<div className="space-y-6 text-center">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-700">
					<FontAwesomeIcon icon={faClock} />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Tu cuenta está pendiente de aprobación
					</h2>
					<p className="mt-3 text-gray-600">
						Un administrador de tu institución revisará tus datos. No se creó
						ninguna sesión y podrás iniciar sesión únicamente después de la
						aprobación.
					</p>
				</div>
				<div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-5 text-left text-sm text-gray-700">
					<p className="flex items-start gap-3">
						<FontAwesomeIcon
							icon={faBuildingColumns}
							className="mt-1 text-electric-500"
						/>
						La aprobación confirma que perteneces a la institución seleccionada.
					</p>
					<p className="flex items-start gap-3">
						<FontAwesomeIcon
							icon={faEnvelope}
							className="mt-1 text-electric-500"
						/>
						Contacta a tu institución si necesitas acelerar la revisión.
					</p>
				</div>
				<Link
					href="/login"
					className="inline-flex rounded-xl bg-electric-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-electric-600"
				>
					Volver al inicio de sesión
				</Link>
			</div>
		</AuthLayout>
	);
}
