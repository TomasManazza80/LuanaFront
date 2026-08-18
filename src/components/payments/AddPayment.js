import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogIcon,
    DialogTitle,
    DialogTrigger
} from "../ui/dialog.tsx";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormGroup,
    FormItem,
    FormLabel,
    FormMessage
} from "../ui/form.tsx";
import {Input} from "../ui/input.tsx";
import {Button} from "../ui/button.tsx";
import {Coins, PlusIcon} from "lucide-react";
import {zodDateInputPipe, zodNumberInputPipe, zodStringPipe} from "../../utils/formatters.js";
import { useGetLeasesQuery} from "../../services/api/leaseApi.js";
import {useCreatePaymentMutation} from "../../services/api/financialsApi.js";
import LeaseSelection from "../comboboxes/LeaseSelection.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import {PaymentStatus} from "../../utils/magicNumbers.js";
import {Checkbox} from "../ui/checkbox.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "../ui/tooltip.tsx";
import {AiOutlineQuestionCircle} from "react-icons/ai";
import {getNextScheduledPayment, getScheduledPaymentStatus} from "../../utils/financials.js";
import {useState} from "react";
import {PaymentScheduleStatusBadge} from "../../utils/statusBadges.js";
import {cn} from "../../utils.ts";

const AddPayment = ({...props}) => {

    const [open, setOpen] = useState(false)
    const {data: leases } = useGetLeasesQuery();

    const [createPayment, {isLoading: isCreating}] = useCreatePaymentMutation();

    const paymentFormSchema = z.object({
        date: zodDateInputPipe(z.string({errorMap: () => ({message: 'Por favor ingrese una fecha válida.'})})),
        amount:  zodNumberInputPipe(z.number({errorMap: () => ({message: 'Por favor ingrese un número válido.'})})),
        notes: zodStringPipe(z.string().or(z.null())),
        status: zodStringPipe(z.string({errorMap: () => ({message: 'Por favor seleccione un estado válido'})})),
        paymentMethod: zodStringPipe(z.string().or(z.null())),
        leaseId: zodNumberInputPipe(z.number({errorMap: () => ({message: 'Por favor seleccione un contrato.'})})),
        updatePaymentSchedule: z.boolean()
    })

    const [selectedLease, setSelectedLease] = useState(null)

    const paymentForm = useForm({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            amount: null,
            date: null,
            status: "PAID",
            notes: null,
            paymentMethod: null,
            leaseId: null,
            updatePaymentSchedule: false,
        },
    })
    const onSubmit = (data) => {
        const body = {...data};
        delete body.updatePaymentSchedule;
        if (selectedLease?.paymentSchedule?.length && data.status === "PAID" && data.updatePaymentSchedule) {
            const nextPayment = getNextScheduledPayment(selectedLease)
            body.leasePaymentSchedule = {
                id: nextPayment?.id,
                amountDue: nextPayment?.amountDue - data.amount,
                status: getScheduledPaymentStatus(nextPayment, data.amount)
            }
        }

        createPayment(body).then((res) => {
            if (res.error) {
                console.log(res.error)
            }
            else {
                setOpen(false)
                paymentForm.reset();
            }
        })
    }

    const PaymentScheduleUpdate = () => {
        const nextPayment = getNextScheduledPayment(selectedLease)
        const amount = paymentForm.watch("amount")
        const updatePaymentSchedule = paymentForm.watch("updatePaymentSchedule")
        const paymentStatus = paymentForm.watch("status")

        if (!nextPayment || !amount || !selectedLease || !updatePaymentSchedule || paymentStatus !== "PAID" ) return null;

        return (
            <div className="p-2 border border-primary-dark rounded-md flex flex-col gap-1">
                <div className="flex flex-col">
                    <p className="text-sm text-foreground font-500">
                        Actualización de Calendario de Pagos
                    </p>
                    <p className="text-sm text-muted-foreground font-400">
                        Según tus cambios, el próximo pago programado (ID: {nextPayment?.id}) para este contrato se actualizará de la siguiente manera:
                    </p>
                </div>
                <div className="grid grid-cols-3">
                    <div className="text-sm flex flex-col gap-1">
                        <p className="text-foreground font-500 opacity-0">
                            Valor
                        </p>
                        <p className="text-foreground font-500">
                            Monto Pendiente
                        </p>
                        <p className="text-foreground font-500">
                            Estado
                        </p>
                    </div>
                    <div  className="text-sm flex flex-col gap-1">
                        <p className="text-foreground font-500">
                            Antes
                        </p>
                        <p className="text-muted-foreground font-400">
                            {nextPayment.amountDue}
                        </p>
                        <p className="text-foreground font-400">
                            <PaymentScheduleStatusBadge status={nextPayment.status}/>
                        </p>
                    </div>
                    <div className="text-sm flex flex-col gap-1">
                        <p className="text-foreground font-500">
                            Después
                        </p>
                        <p className={cn("text-muted-foreground font-400", (nextPayment.amountDue - amount) < 0 && "text-red-500" )}>
                            {nextPayment.amountDue - amount}
                        </p>
                        <p className="text-foreground font-400">
                            <PaymentScheduleStatusBadge status={getScheduledPaymentStatus(nextPayment, amount)}/>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Dialog {...props} onOpenChange={() => setOpen(!open)} open={open}>
            <Button onClick={() => setOpen(!open)} variant="outline" type="button">
                {props.children}
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogIcon>
                        <Coins className="w-6 h-6"/>
                    </DialogIcon>
                    <DialogTitle>
                       Agregar Pago
                    </DialogTitle>
                    
                    <DialogDescription>
                        Agrega un nuevo pago al sistema.
                    </DialogDescription>
                </DialogHeader>

                {/* CONTENEDOR SCROLLABLE */}
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                    <Form {...paymentForm}>
                        <form
                            onSubmit={paymentForm.handleSubmit(onSubmit)}
                            className="flex flex-col gap-2"
                        >
                            <FormGroup asFlex>
                                <FormField
                                    control={paymentForm.control}
                                    name="leaseId"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Contrato *</FormLabel>
                                            <FormControl >
                                                <LeaseSelection onSelect={(leaseId) => {
                                                    paymentForm.setValue('leaseId', leaseId)
                                                    setSelectedLease(leases?.data?.find((lease) => lease.id === leaseId))
                                                    paymentForm.trigger('leaseId')
                                                }} selected={Number(paymentForm.getValues("leaseId"))} leases={leases?.data}
                                                                className="w-full"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={paymentForm.control}
                                    name="amount"
                                    render={({field}) => (
                                        <FormItem >
                                            <FormLabel>Monto *</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="200" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormField
                                    control={paymentForm.control}
                                    name="notes"
                                    render={({field}) => (
                                        <FormItem >
                                            <FormLabel>Inquilino</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="pon el nombre del inquilino" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup asFlex>
                                <FormField
                                    control={paymentForm.control}
                                    name="status"
                                    render={({field}) => (
                                        <FormItem >
                                            <FormLabel>Estado</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione el estado del pago" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {
                                                        Object.keys(PaymentStatus).map((status, index) => {
                                                            return (
                                                                <SelectItem key={index} value={status}>{PaymentStatus[status]}</SelectItem>
                                                            )
                                                        })
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormField
                                control={paymentForm.control}
                                name="date"
                                render={({field}) => (
                                    <FormItem >
                                        <FormLabel>Fecha de Pago *</FormLabel>
                                        <FormControl>
                                            <Input {...field} defaultValue="09:00" type="datetime-local"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={paymentForm.control}
                                name="updatePaymentSchedule"
                                render={({field}) => (
                                    <FormItem className="flex flex-row items-start gap-2 space-y-0 mt-2 ">
                                        <Checkbox title={!selectedLease?.paymentSchedule?.length || paymentForm.watch("status") !== "PAID" ? "Por favor seleccione un contrato con un Calendario de Pagos y establezca el Estado de Pago como 'Pagado' para usar esto." : ""} disabled={!selectedLease?.paymentSchedule?.length || paymentForm.watch("status") !== "PAID"} className="" checked={paymentForm.watch("updatePaymentSchedule")} onClick={() => {
                                            paymentForm.setValue('updatePaymentSchedule', !paymentForm.watch("updatePaymentSchedule"))
                                        }}  {...field} />
                                        <div className="flex flex-col gap-1">
                                            <FormLabel className="flex flex-row items-center">
                                                Actualizar Calendario de Pagos
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="ml-1 cursor-pointer">
                                                                <AiOutlineQuestionCircle className="w-4 h-4 text-muted-foreground"/>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs md:max-w-md lg:max-w-lg text-wrap">
                                                            <p hidden>
                                                                Cuando está marcado, este pago se aplicará al próximo pago programado del contrato, reduciendo el monto pendiente. Si el pago cubre el monto total, el pago programado se marcará como 'Pagado'.
                                                            </p>
                                                            <p>
                                                                Esto requiere que el contrato tenga un calendario de pagos y que el estado del pago esté establecido como 'Pagado'.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </FormLabel>
                                            <FormDescription>
                                                Si existe un pago planificado para el contrato seleccionado, se actualizará en consecuencia.
                                            </FormDescription>
                                            <FormMessage/>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <PaymentScheduleUpdate/>

                            <div className="flex justify-between gap-2 mt-4">
                                <Button type="button" variant="outline" className="w-full" onClick={() => {
                                    setOpen(false)
                                    paymentForm.reset();
                                }}>Cancelar</Button>
                                <Button type="submit" variant="gradient" className="w-full" isLoading={isCreating}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Crear
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddPayment;
