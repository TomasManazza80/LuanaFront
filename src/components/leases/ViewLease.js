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
import {Coins, CalendarClock, Scroll} from "lucide-react";
import {cn} from "../../utils.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs.tsx";
import PaymentTable from "../financials/PaymentTable.tsx";
import PaymentScheduleTable from "../financials/PaymentScheduleTable.tsx";
import {LeaseStatus} from "../../utils/magicNumbers.js";
import ExpensesTable from "../financials/ExpensesTable.tsx";


const ViewLease = ({lease, open, setOpen, ...props}) => {

    const entriesLeft = [
        {
            label: "Fecha de inicio",
            value: dateParser(lease.startDate)  || "N/A"
        },
        {
            label: "Creado el",
            value: dateParser(lease?.createdAt)  || "N/A"
        },
        {
            label: "Precio de alquiler",
            value: moneyParser(lease.rentalPrice) ?? "N/A"
        },
        {
            label: "Notas",
            value: lease.notes  || "N/A"
        }
    ]


    const entriesRight = [
        {
            label: "Fecha de finalización",
            value: dateParser(lease.endDate) || "N/A"
        },
        {
            label: "ID de Contrato",
            value: lease.id  || "N/A"
        },
        {
            label: "Estado",
            value: LeaseStatus[lease?.status]  || "N/A"
        },
        {
            label: "Términos especiales",
            value: lease.specialTerms  || "N/A"
        }
    ]

    const payments = lease?.rentPayments.map(payment => {
        return {
            ...payment,
            lease: lease,
            tenant: lease?.tenant
        }
    }) || []

    const paymentSchedules = lease?.paymentSchedule.map(schedule => {
        return {
            ...schedule,
            lease: lease,
            tenant: lease?.tenant
        }
    }) || []

    const expenses = lease?.expenses.map(expense => {
        return {
            ...expense,
            lease: lease,
        }
    }) || []


    return (
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
            <DialogContent>
                <DialogHeader>
                    <DialogIcon>
                        {<Scroll className="w-6 h-6"/>}
                    </DialogIcon>
                    <DialogTitle>
                        Información del Contrato
                    </DialogTitle>
                    <DialogDescription>
                        A continuación, encontrará los detalles del contrato seleccionado.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="information" className="overflow-auto" >
                    <TabsList>
                        <TabsTrigger value={"information"}>
                            Información
                        </TabsTrigger>
                        <TabsTrigger value={"payments"}>
                            Pagos
                        </TabsTrigger>
                        <TabsTrigger value={"payment-schedule"}>
                            Cronograma de Pagos
                        </TabsTrigger>
                        <TabsTrigger value={"expenses"}>
                            Gastos
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value={"information"}>
                        <div className="grid grid-cols-2">
                            <div className="w-full flex flex-col gap-1 text-sm">
                                {entriesLeft.map((entry, index) => {
                                    return (
                                        <div key={index} className="w-full">
                                            <div className="text-muted-foreground font-500">
                                                {entry.label}
                                            </div>
                                            <div className="text-md text-foreground font-400">
                                                {entry.value}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="w-full flex flex-col gap-1 text-sm">
                                {entriesRight.map((entry, index) => {
                                    return (
                                        <div key={index} className="w-full">
                                            <div className="text-muted-foreground font-500">
                                                {entry.label}
                                            </div>
                                            <div className="text-md text-foreground font-400">
                                                {entry.value}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="w-full flex flex-col text-sm mt-4 border-t border-input pt-2">
                            <div className="text-muted-foreground font-500">
                                Inquilino
                            </div>
                            <div className="text-foreground font-500">
                                {lease?.tenant?.firstName} {lease?.tenant?.lastName}
                            </div>
                            <div className="text-foreground font-400">
                                {lease?.tenant?.email}
                            </div>
                        </div>

                    </TabsContent>
                    <TabsContent value={"payments"}>
                        <PaymentTable payments={payments} pageSize={5} subtitle={""}/>
                    </TabsContent>
                    <TabsContent value={"payment-schedule"}>
                        <PaymentScheduleTable paymentSchedules={paymentSchedules} pageSize={5} subtitle={""}/>
                    </TabsContent>
                    <TabsContent value={"expenses"}>
                        <ExpensesTable expenses={expenses} pageSize={5} subtitle={""}/>
                    </TabsContent>
                </Tabs>

            </DialogContent>
        </Dialog>
    )
}


export default ViewLease;