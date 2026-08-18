import {
    ColumnDef,
} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "../ui/dropdown-menu.tsx";
import {Button} from "../ui/button.tsx";
import {Building2, MoreHorizontal, Pencil} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {dateParser, moneyParser} from "../../utils/formatters.js";
import {Unit} from "../../utils/classes.ts";
import {DataTable} from "../ui/data-table.js";
import {ListingStatusBadge} from "../../utils/statusBadges.js";
import Link from "../general/Link.tsx";
import EditRentalUnit from "./EditRentalUnit";
import {useState} from "react";



const RentalTableDropdown = ({unit}) => {
    const navigate = useNavigate()
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <DropdownMenu>
            <EditRentalUnit unit={unit} open={modalOpen} setOpen={() => setModalOpen(!modalOpen)} />
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setModalOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator/>

                <DropdownMenuItem
                    onClick={() => navigate(`/properties/${unit.realEstateObjectId}`)}
                >
                    <Building2 className="h-4 w-4 mr-2" />
                    Ver Propiedad
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

}



const columns: ColumnDef<Unit>[] = [
    {
        id: "unit",
        header: "Identificador de Unidad",
        cell: ({ row })=> {
            return (
                <Link id={row.original.id} type={"unit"}  />
            )
        },
        meta: {
            type: "string",
        },
        accessorFn: (row) => {
            return row.unitIdentifier
        },
        enableSorting: true,
        enableHiding: false,
    },
    {
        id: "property",
        enableSorting: true,
        header: "Propiedad",
        meta: {
            type: "string",
        },
        cell: ({ row }) => {
            const property = row?.original?.realEstateObject;
            return (
            <div className="capitalize font-400">
                {property?.title}
            </div>
            )
        },
        accessorFn: (row) => {
            return row.realEstateObject.title
        }
    },
    {
        id: "status",
        header: "Estado",
        enableSorting: true,
        cell: ({ row }) => (
            <ListingStatusBadge status={row.original.status} />
        ),
        meta: {
            type: "string"
        },
        accessorFn: (row) => {
            return row.status
        }
    },

    {
        id: "currentTenant",
        header: "Inquilino Actual",
        enableSorting: true,
        cell: ({ row }) => {
            if (row?.original?.tenantId) {
                // Tenant name
                return (
                    <Link id={row.original.tenantId} type={"tenant"} />
                )
            }
            return (
                "Sin Inquilino"
            )
        },
        meta: {
            type: "string"
        },
        accessorFn: (row) => {
            return row?.tenant?.firstName + " " + row.tenant?.lastName
        }


    },
    {
        id: "leaseStartDate",
        header: "Fecha de Inicio de Arrendamiento",
        enableSorting: true,
        cell: ({ row }) => {
            const leases = row.original.leases



            if (leases && leases.length && leases[0].startDate) {
                return (
                    <div>
                        {
                            dateParser(leases[0]?.startDate)
                        }
                    </div>
                )
            } else {
                return (
                    ""
                )
            }
        },
        meta: {
            type: "date"
        },
        accessorFn: (row) => {
            return row.leases[0]?.startDate || undefined
        }
    },

    {
        id: "leaseEndDate",
        header: "Fecha de Fin de Arrendamiento",
        enableSorting: true,
        cell: ({ row }) => {
            const leases = row.original.leases


            if (leases && leases.length && leases[0].endDate) {
                return (
                    <div>
                        {
                           dateParser(leases[0]?.endDate)
                        }
                    </div>
                )
            } else {
                return (
                    ""
                )
            }
        },
        meta: {
            type: "date"
        },
        accessorFn: (row) => {
            return row.leases[0]?.endDate || undefined
        }
    },

    {
        id: "monthlyRent",
        header: "Alquiler Mensual",
        enableSorting: true,
        cell: ({ row }) => {
            return (
                <div>
                    {moneyParser(row.original.rentalPrice)}
                </div>
            )
        },
        meta: {
            type: "number"
        },
        accessorFn: (row) => {
            return row.rentalPrice || undefined
        }
    },


    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const unit = row.original

            return <RentalTableDropdown unit={unit} />
        },
    },
]

// eslint-disable-next-line react/prop-types
const RentalTable = ({ units, ...props  }) => {

    return (
        <DataTable data={units} columns={columns}  {...props}
        />
    )

}

export default RentalTable;