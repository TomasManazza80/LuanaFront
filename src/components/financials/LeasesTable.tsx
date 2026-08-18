import {
    ColumnDef,
} from "@tanstack/react-table";
import {Checkbox} from "../ui/checkbox.tsx";
import {dateParser, moneyParser} from "../../utils/formatters.js";
import {DataTable} from "../ui/data-table.js";
import {Lease, RentPayment} from "../../utils/classes.ts";
import {Eye, MoreHorizontal, Pencil, Scroll, Trash2} from "lucide-react";
import {LeaseStatusBadge} from "../../utils/statusBadges.js";
import {LeaseStatus} from "../../utils/magicNumbers.js";
import Link from "../general/Link.tsx";
import {useMemo, useState} from "react";
import {useDeleteLeaseMutation} from "../../services/api/leaseApi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "../ui/dropdown-menu.tsx";
import EditLease from "../leases/EditLease";
import DeleteDialog from "../general/DeleteDialog";
import {useDeleteLeasesMutation, useUpdateLeasesMutation} from "../../services/api/bulkApi";
import {Button} from "../ui/button.tsx";
import ViewLease from "../leases/ViewLease.js";
import {isWithinInterval, subDays} from "date-fns";
import {ButtonGroup, ButtonGroupItem} from "../ui/button-group.tsx";



const LeaseActions = ({lease}) => {
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)

    const [deleteLease] = useDeleteLeaseMutation();

    return (
        <DropdownMenu>
            <EditLease lease={lease} open={editModalOpen} setIsOpen={setEditModalOpen} />

            <DeleteDialog
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Eliminar Contrato de Arrendamiento"
                content="¿Estás seguro de que quieres eliminar este contrato de arrendamiento? Esta acción no se puede deshacer."
                onConfirm={() => deleteLease(lease?.id)}
            />

            {viewModalOpen && <ViewLease lease={lease} open={viewModalOpen} setOpen={setViewModalOpen} />}

            <DropdownMenuTrigger asChild className="cursor-pointer">
                <MoreHorizontal className="h-5 w-5 ml-3"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-row text-sm gap-2" onClick={() => setViewModalOpen(true)}>
                        <Eye className="w-4 h-4"/>
                        Ver
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                        <Pencil className="w-4 h-4 mr-2"/>
                        Editar
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator/>

                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex flex-row text-sm text-red-500"
                                          onClick={() => setDeleteModalOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2"/>
                        Eliminar Contrato de Arrendamiento
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}


const columns: ColumnDef<Lease>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                // @ts-expect-error - TS doesn't understand that we're using a custom accessor
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
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
        id: "lease",
        header: "Contrato de Arrendamiento",
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
        id: "tenant",
        header: "Inquilino",
        cell: ({ row }) => {
            if (row?.original?.tenantId) {
                return (
                    <Link id={row.original.tenantId} type={"tenant"} />
                )
            }
            else {
                return (
                    <div className="capitalize text-red-600/90 font-500">Sin Inquilino</div>
                )
            }
        },
        accessorFn: (row) => (row?.tenant?.firstName + " " + row?.tenant?.lastName) || "",
        meta: {
            type: "string",
        },
        enableSorting: true,
    },
    {
        id: "startDate",
        header: "Fecha de Inicio",
        meta: {
            type: "date",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {dateParser(row?.original?.startDate)}
                </div>
            )
        },
        accessorFn: (row) => row?.startDate || "",
        enableSorting: true,

    },
    {
        id: "endDate",
        header: "Fecha de Fin",
        meta: {
            type: "date",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {dateParser(row?.original?.endDate)}
                </div>
            )
        },
        accessorFn: (row) => row?.endDate || "",
        enableSorting: true,
    },
    {
        id: "rentalPrice",
        header: "Precio de Alquiler",
        meta: {
            type: "string",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {moneyParser(row?.original?.rentalPrice)}
                </div>
            )
        },
        accessorFn: (row) => row?.rentalPrice || "",
        enableSorting: true,
    },
    {
        id: "unit",
        header: "Unidad",
        cell: ({ row }) => {
            if (row?.original?.unitId) {
                return (
                    <Link id={row.original.unitId} type={"unit"}  />
                )
            }
            else {
                return (
                    <div className="capitalize text-red-500">Sin Unidad</div>
                )
            }
        },
        accessorFn: (row) => row?.unit?.unitIdentifier || "",
        meta: {
            type: "string",
        },
        enableSorting: true,
    },
    {
        id: "status",
        header: "Estado",
        meta: {
            type: "enum",
            options: Object.values(LeaseStatus)
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
        id: "paymentFrequency",
        header: "Frecuencia de Pago",
        meta: {
            type: "string",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {row?.original?.paymentFrequency?.toLowerCase()}
                </div>
            )
        },
        accessorFn: (row) => row?.paymentFrequency || "",
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
                    {row?.original?.notes}
                </div>
            )
        },
        accessorFn: (row) => row?.notes || "",
        enableSorting: true,
    },
    {
        id: "specialTerms",
        header: "Términos Especiales",
        meta: {
            type: "string",
        },
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {row?.original?.specialTerms}
                </div>
            )
        },
        accessorFn: (row) => row?.specialTerms || "",
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Acciones",
        enableHiding: false,
        cell: ({ row }) => {
            const lease = row.original
            return (
                <LeaseActions lease={lease}/>
            )
        },
    },
]

const LeaseBulkActions = ({selectedRows}) => {

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    const [updateLeases] = useUpdateLeasesMutation();
    const [deleteLeases] = useDeleteLeasesMutation();


    if (selectedRows.length === 0) {
        return null
    }


    const handleDeleteLeases = () => {
        deleteLeases(selectedRows)
    }

    const handleStatusChange = (status: string) => {
        const body = selectedRows.map((row) => {
            return {
                id: row.id,
                status: status
            }
        })

        updateLeases(body);
    }

    return (
        <DropdownMenu>
            <DeleteDialog
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Eliminar Contratos de Arrendamiento"
                content={`Estás a punto de eliminar ${selectedRows?.length} contrato(s) de arrendamiento. ¿Estás seguro?`}
                onConfirm={handleDeleteLeases}
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
                            {Object.keys(LeaseStatus).map((status) => (
                                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                                    {LeaseStatus[status]}
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


const LeasesTable = ({ leases }) => {

    const [selectedRows, setSelectedRows] = useState([])

    const [selectedFilter, setSelectedFilter] = useState("active")

    const filteredLeases = useMemo(() => {
        if (selectedFilter === "all") return leases
        if (selectedFilter === "active") {
            return leases?.filter((lease) => lease.status === "ACTIVE")
        }
        if (selectedFilter === "inactive") {
            return leases?.filter((lease) => lease.status !== "ACTIVE")
        }

    }, [selectedFilter, leases])


    return (
        <div className={"border-2 border-border p-4 rounded-lg "}>

            <DataTable
                data={filteredLeases}
                columns={columns}
                title="Contratos de Arrendamiento"
                subtitle="Estos son todos tus contratos de arrendamiento."
                icon={<Scroll className={"w-5 h-5"} />}
                defaultSort={{id: "lease", desc: true}}
                onRowSelectionChange={(selectedRows) => setSelectedRows(selectedRows)}
            >

                <ButtonGroup
                    value={selectedFilter}
                    onValueChange={(value) => setSelectedFilter(value)}
                >
                    <ButtonGroupItem value={"all"} >
                        Ver Todos
                    </ButtonGroupItem>
                    <ButtonGroupItem value={"active"}>
                        Activos
                    </ButtonGroupItem>
                    <ButtonGroupItem value={"inactive"}>
                        Inactivos
                    </ButtonGroupItem>
                </ButtonGroup>

                <LeaseBulkActions selectedRows={selectedRows}/>

            </DataTable>

        </div>

    )
}

export default LeasesTable;