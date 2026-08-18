import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogIcon,
    DialogTitle,
    DialogTrigger
} from "../ui/dialog.tsx";
import {dateParser, moneyParser} from "../../utils/formatters.js";
import {useSelector} from "react-redux";
import {selectLeaseById} from "../../services/slices/objectSlice.js";
import {Coins, CalendarClock} from "lucide-react";
import {cn} from "../../utils.ts";


const ViewPayment = ({payment, open, setOpen, ...props}) => {

    const userData = useSelector(state => state.authSlice.userInfo)

    const lease = useSelector(state => selectLeaseById(state, payment?.leaseId))

    const getTenantName = () => {
        if (lease.tenant) {
            return `${lease.tenant.firstName} ${lease.tenant.lastName}`
        }
        return "-"
    }

    const paymentEntries = [
        {
            label: "Monto",
            value: moneyParser(payment.amount)
        },
        {
            label: "Fecha",
            value: dateParser(payment.date)
        },
        {
            label: "Estado",
            value: payment.status,
        },
        {
            label: "Enviado Por",
            value: Number(payment.submittedBy) === userData.id ? "Tú" : "Inquilino"
        },
        {
            label: "Fecha de Envío",
            value: dateParser(payment.submissionDate)
        },
        {
            label: "Fecha de Aprobación",
            value: dateParser(payment.approvalDate)
        },
        {
            label: "Método de Pago",
            value: payment.paymentMethod
        },
        {
            label: "Notas",
            value: payment.notes
        },
        {
            label: "Contrato",
            value: payment.leaseId,
        },
        {
            label: "Inquilino",
            value: getTenantName()
        }
    ]

    const paymentScheduleEntries = [
        {
            label: "Monto Adeudado",
            value: moneyParser(payment.amountDue)
        },
        {
            label: "Fecha de Vencimiento",
            value: dateParser(payment.dueDate)
        },
        {
            label: "Estado",
            value: payment.status,
        },
        {
            label: "Contrato",
            value: payment.leaseId,
        },
        {
            label: "Inquilino",
            value: `${lease.tenant?.firstName} ${lease?.tenant?.lastName}`
        }
    ]

    const entries = payment.dueDate ? paymentScheduleEntries : paymentEntries;
    const title = payment.dueDate ? "Ver Pago Planificado" : "Ver Pago"
    const description = payment.dueDate ? "Los detalles del cronograma de pagos se muestran a continuación." : "Los detalles del pago se muestran a continuación."

    return (
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
            <DialogContent>
                <DialogHeader>
                    <DialogIcon>
                        {payment.dueDate ? <CalendarClock className="w-6 h-6"/> : <Coins className="w-6 h-6"/>}
                    </DialogIcon>
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div>
                    {entries.map((entry, index) => (
                                <div key={index} className="flex flex-row justify-between">
                                    <p className="text-foreground font-400">
                                        {entry.label}
                                    </p>
                                    <p className="max-w-[50%] text-muted-foreground">
                                        {entry.value || "-"}
                                    </p>
                                </div>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default ViewPayment;