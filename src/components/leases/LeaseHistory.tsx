import {dateParser, moneyParser} from "../../utils/formatters.js";
import {DataTable} from "../ui/data-table.js";
import {ColumnDef} from "@tanstack/react-table";
import {Lease} from "../../utils/classes.ts";
import { Scroll} from "lucide-react";
import {PaymentFrequency} from "../../utils/magicNumbers.js";
import {LeaseStatusBadge} from "../../utils/statusBadges.js";
import Link from "../general/Link.tsx";





const LeaseHistory = ({leases, ...props}) => {

    const columns: ColumnDef<Lease>[] = [
        {
            id: "unit",
            header: "Unidad",
            meta: {
                type: "string",
            },
            cell: ({ row }) => {

                return (
                    <Link id={row.original.unitId} type={"unit"} />
                )
            },
            accessorFn: (row) => row?.startDate || undefined,
            enableSorting: true,
        },
        {
            id: "startDate",
            header: "Fecha de inicio",
            meta: {
                type: "date",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize font-500">
                        {dateParser(row?.original?.startDate)}
                    </div>
                )
            },
            accessorFn: (row) => row?.startDate || undefined,
            enableSorting: true,
        },
        {
            id: "endDate",
            header: "Fecha de finalización",
            meta: {
                type: "date",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize font-500">
                        {dateParser(row?.original?.endDate)}
                    </div>
                )
            },
            accessorFn: (row) => row?.endDate || undefined,
            enableSorting: true,

        },
        {
            id: "rentalPrice",
            header: "Precio de alquiler",
            meta: {
                type: "string",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize font-500">
                        {moneyParser(row?.original?.rentalPrice)}
                    </div>
                )
            },
            accessorFn: (row) => row?.rentalPrice || undefined,
            enableSorting: true,
        },
        {
            id: "paymentFrequency",
            header: "Frecuencia de pago",
            meta: {
                type: "string",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize">
                        {PaymentFrequency[row?.original?.paymentFrequency]}
                    </div>
                )
            },
            accessorFn: (row) => row?.paymentFrequency || undefined,
            enableSorting: true,
        },
        {
            id: "status",
            header: "Estado",
            meta: {
                type: "string",
            },
            cell: ({ row }) => {
                return (
                    <LeaseStatusBadge status={row?.original?.status} />
                )
            },
            accessorFn: (row) => row?.status || undefined,
            enableSorting: true,
        },
        {
            id: "nextPaymentDue",
            header: "Próximo pago vence",
            meta: {
                type: "date",
            },
            cell: ({ row }) => {
                const paymentSchedule = row?.original?.paymentSchedule;

                if (!paymentSchedule || !paymentSchedule.length) return null;

                // Find oldest payment that is not "PAID"
                const oldestUnpaidPayment = paymentSchedule.find(p => p.status !== "PAID");

                return (
                    <div className="capitalize font-500">
                        {dateParser(oldestUnpaidPayment?.dueDate)}
                    </div>
                )
            },
            accessorFn: (row) => row?.totalRentDue || undefined,
            enableSorting: true,

        },
        {
            id: "totalRentPaid",
            header: "Alquiler total pagado",
            meta: {
                type: "number",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize font-500">
                        {moneyParser(row?.original?.rentPaid)}
                    </div>
                )
            },
            accessorFn: (row) => row?.rentPaid || undefined,
            enableSorting: true,
        },
        {
            id: "notes",
            header: "Notas",
            meta: {
                type: "string",
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize">
                        {row.original?.notes}
                    </div>
                )
            },
            accessorFn: (row) => row?.notes || undefined,
            enableSorting: true,
        },
    ]



    return (
            <DataTable data={leases} columns={columns} title="Historial de Arrendamientos" icon={<Scroll className={"w-5 h-5"} />}
                       defaultSort={{id: "startDate", desc: true}} {...props}
            >
                {props.children}
            </DataTable>
        )
}

export default LeaseHistory;