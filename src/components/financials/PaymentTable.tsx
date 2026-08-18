import {
    ColumnDef,
} from "@tanstack/react-table";
import {dateParser, moneyParser} from "../../utils/formatters.js";
import {DataTable} from "../ui/data-table2.js";
import {LeasePaymentSchedule, RentPayment} from "../../utils/classes.ts";
import {PaymentStatusBadge} from "../../utils/statusBadges.js";
import {Check, Coins, Eye, MoreHorizontal, Pencil, Trash2} from "lucide-react";
import ViewPayment from "../payments/ViewPayment.js"
import {PaymentScheduleStatus, PaymentStatus} from "../../utils/magicNumbers.js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "../ui/dropdown-menu.tsx";
import {useDeletePaymentMutation, useUpdatePaymentMutation} from "../../services/api/financialsApi.js";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogIcon,
    DialogTitle,
} from "../ui/dialog.tsx";
import {useCallback, useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {paymentSchema} from "../../utils/formSchemas.js";
import {Form, FormControl, FormField, FormGroup, FormItem, FormLabel, FormMessage} from "../ui/form.tsx";
import {Input} from "../ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import {Button} from "../ui/button.tsx";
import Link from "../general/Link.tsx";
import {Textarea} from "../ui/textarea.tsx";
import DeleteDialog from "../general/DeleteDialog";
import {Checkbox} from "../ui/checkbox.tsx";
import {
    useCreatePaymentsMutation,
    useDeletePaymentSchedulesMutation, useDeletePaymentsMutation,
    useUpdatePaymentSchedulesMutation, useUpdatePaymentsMutation
} from "../../services/api/bulkApi";
import {ButtonGroup, ButtonGroupItem} from "../ui/button-group.tsx";
import {isWithinInterval, subDays} from "date-fns";

const PaymentStatusTranslations = {
    Paid: "Pagado",
    Pending: "Pendiente",
    Reported: "Reportado",
    Cancelled: "Cancelado",
    Rejected: "Rechazado",
};

const PaymentActions = ({ payment }) => {
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)

    const [updatePayment, {isLoading: isUpdating}] = useUpdatePaymentMutation()
    const [deletePayment] = useDeletePaymentMutation()

    const paymentForm = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues:{
            ...payment,
        }
    })

    const handleSubmit = (data) => {
        updatePayment({id: payment?.id, body: data}).then((res) => {
            if (res.error) return
            setEditModalOpen(false)
        })
    }

    return (
        <DropdownMenu>
            <Dialog open={editModalOpen} onOpenChange={() => setEditModalOpen(!editModalOpen)} >
                <DialogContent>
                    <DialogHeader>
                        <DialogIcon>
                            <Coins className="w-6 h-6"/>
                        </DialogIcon>
                        <DialogTitle>
                            Editar Pago
                        </DialogTitle>
                        <DialogDescription>
                            Actualiza los detalles de este pago.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...paymentForm}>
                        <form onSubmit={paymentForm.handleSubmit(handleSubmit)} className="flex flex-col gap-2">
                            <FormGroup>
                                <FormField
                                    control={paymentForm.control}
                                    name="amount"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Monto</FormLabel>
                                            <FormControl>
                                                <Input type="currency" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={paymentForm.control}
                                    name="date"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Fecha</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormField
                                    control={paymentForm.control}
                                    name="status"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.keys(PaymentStatus).map((statusKey, index) => {
                                                        const displayStatus = PaymentStatusTranslations[statusKey] || PaymentStatus[statusKey];
                                                        return (
                                                            <SelectItem key={index} value={statusKey}>{displayStatus}</SelectItem>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={paymentForm.control}
                                    name="paymentMethod"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Método de Pago</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormField
                                control={paymentForm.control}
                                name="notes"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Notas</FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <div className="w-full flex flex-row gap-2 justify-between mt-2">
                                <Button variant="outline" type="reset" onClick={() => {
                                    setEditModalOpen(false)
                                    paymentForm.reset()
                                }}
                                        disabled={isUpdating} className="w-full">
                                    Cancelar
                                </Button>
                                <Button variant="gradient" type="submit" isLoading={isUpdating} disabled={isUpdating} className="w-full">
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Eliminar Pago"
                content="¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer."
                onConfirm={() => deletePayment(payment?.id)}
            />

            {viewModalOpen && <ViewPayment open={viewModalOpen} setOpen={setViewModalOpen} payment={payment} />}

            <DropdownMenuTrigger asChild className="cursor-pointer">
                <MoreHorizontal className="h-5 w-5 ml-3"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[150px]">
                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-row text-sm gap-2" onClick={() => setViewModalOpen(true)}>
                        <Eye className="w-4 h-4"/>
                        Ver
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex flex-row text-sm gap-2" onClick={() => setEditModalOpen(true)}>
                        <Pencil className="w-4 h-4"/>
                        Editar
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-row text-sm gap-2 text-red-500"
                                      onClick={() => setDeleteModalOpen(true)}
                    >
                        <Trash2 className="w-4 h-4"/>
                        Eliminar Pago
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const columns: ColumnDef<RentPayment>[] = [
   {
    id: "select",
    header: ({ table }) => (
        <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ?
                    true :
                    table.getIsSomePageRowsSelected() ?
                        "indeterminate" :
                        false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todo"
        />
    ),
    cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
        />
    ),
    enableSorting: false,
    enableHiding: false,
},
    {
        id: "id",
        header: "ID",
        cell: ({ row }) => (
            <div className="capitalize">#{row?.original?.id}</div>
        ),
        meta: {
            type: "number",
        },
        accessorFn: (row) => row?.id || "",
        enableSorting: true,
    },
    {
        id: "notes",
        header: "inquilino",
        cell: ({ row }) => (
            <div className="capitalize">
                {row?.original?.notes}
            </div>
        ),
        accessorFn: (row) => row?.paymentMethod || "",
        meta: {
            type: "string",
        },
        enableSorting: true,
    },
    {
        id: "amount",
        header: "Monto",
        meta: {
            type: "number",
        },
        cell: ({ row }) => (
            <div className="capitalize font-600">
                {moneyParser(row?.original?.amount)}
            </div>
        ),
        accessorFn: (row) => row?.amount || 0,
        enableSorting: true,
    },
    {
        id: "paymentDate",
        header: "Fecha de Pago",
        cell: ({ row }) => (
            <div className="capitalize">
                {dateParser(row?.original?.date)}
            </div>
        ),
        accessorFn: (row) => row?.date || "",
        meta: {
            type: "date",
        },
        enableSorting: true,
    },
    {
        id: "submissionDate",
        header: "Fecha de Envío",
        cell: ({ row }) => (
            <div className="capitalize">
                {dateParser(row?.original?.submissionDate)}
            </div>
        ),
        accessorFn: (row) => row?.submissionDate || "",
        meta: {
            type: "date",
        },
        enableSorting: true,
    },
    {
        id: "status",
        header: "Estado",
        meta: {
            type: "enum",
            options: Object.values(PaymentStatus),
        },
        cell: ({ row }) => (
            <PaymentStatusBadge status={row?.original?.status} />
        ),
        accessorFn: (row) => row?.status,
        enableSorting: true,
    },
    {
        id: "lease",
        header: "Contrato de Arrendamiento",
        cell: ({ row }) => {
            const lease = row.original?.lease;
            if (!lease) return "Sin Contrato"
            return <div>#{lease?.id}</div>
        },
        meta: {
            type: "number",
        },
        accessorFn: (row) => row?.leaseId || "",
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Acciones",
        enableHiding: false,
        cell: ({ row }) => {
            const payment = row.original
            return <PaymentActions payment={payment}/>
        },
    },
]

const PaymentBulkActions = ({selectedRows}) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [updatePayments] = useUpdatePaymentsMutation()
    const [deletePayments] = useDeletePaymentsMutation()

    if (selectedRows?.length === 0) {
        return null
    }

    const handleDelete = () => {
        deletePayments(selectedRows);
    }

    const handleStatusChange = (status) => {
        const body = selectedRows.map((row) => ({
            id: row.id,
            status: status
        }))
        updatePayments(body);
    }

    return (
        <DropdownMenu>
            <DeleteDialog
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Eliminar Pagos"
                content={`Estás a punto de eliminar ${selectedRows?.length} pago(s). ¿Estás seguro?`}
                onConfirm={handleDelete}
            />

            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Pencil className="w-4 h-4 mr-2"/> {selectedRows?.length} Seleccionado(s)
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            Establecer Estado
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {Object.keys(PaymentStatus).map((status) => (
                                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                                    {PaymentStatusTranslations[status] || PaymentStatus[status]}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator/>

                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-row text-sm text-red-500"
                                      onClick={() => setDeleteModalOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2"/>
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const PaymentTable = ({ payments, ...props }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    const filteredPayments = useMemo(() => {
        let result = [...payments];

        if (selectedFilter === "30-days") {
            result = result.filter((payment: RentPayment) =>
                isWithinInterval(new Date(payment.date), {
                    start: subDays(new Date(), 30),
                    end: new Date()
                })
            );
        } else if (selectedFilter === "90-days") {
            result = result.filter((payment: RentPayment) =>
                isWithinInterval(new Date(payment.date), {
                    start: subDays(new Date(), 90),
                    end: new Date()
                })
            );
        }

        // Nuevo filtro por la columna "notes"
        if (searchValue.trim() !== "") {
            result = result.filter((payment: RentPayment) =>
                payment.notes?.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        return result;
    }, [payments, selectedFilter, searchValue]);

    return (
        <div className="border-2 border-border p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Pagos
                </h2>
                
            </div>

            <p className="text-muted-foreground text-sm">
                Esta tabla registra los pagos realizados por los inquilinos.
            </p>
<Input
                    placeholder="Buscar en Inquilono..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                 className="w-64 border bg-blue-200 w-[500px]"
                />
           

            <DataTable
                data={filteredPayments}
                columns={columns}
                defaultSort={{ id: "submissionDate", desc: true }}
                onRowSelectionChange={(selected: RentPayment[]) => setSelectedRows(selected)}
                {...props}
            >   
                {props.children}
                <PaymentBulkActions selectedRows={selectedRows} />
            </DataTable>
        </div>
    );
};

export default PaymentTable;
