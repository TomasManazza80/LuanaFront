import {
    ColumnDef,
} from "@tanstack/react-table";
import {DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem} from "../ui/dropdown-menu.tsx";
import {Checkbox} from "../ui/checkbox.tsx";
import {Button} from "../ui/button.tsx";
import {MoreHorizontal} from "lucide-react";
import {RealEstateType} from "../../utils/magicNumbers.js"
import {dateParser, moneyParser} from "../../utils/formatters.js";
import {Property} from "../../utils/classes.ts";
import {DataTable} from "../ui/data-table.js"

const columns: ColumnDef<Property>[] = [
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
                className="mr-3"
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
        accessorKey: "realEstateType",
        header: "Tipo",
        enableSorting: true,
        cell: ({ row }) => (
            <div className="capitalize">{RealEstateType[row.getValue("realEstateType")]}</div>
        ),
        meta: {
            type: "string"
        }
    },
    {
        accessorKey: "title",
        header: "Título",
        enableSorting: true,
        cell: ({ row }) => <div className="lowercase">{row.getValue("title")}</div>,
        meta: {
            type: "string"
        }
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => {
            return (
                <div title={row.original.description} className="lowercase overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{row.getValue("description")}</div>
            )
        },
        meta: {
            type: "string"
        },
        enableSorting: true,
    },
    {
        accessorKey: "marketPrice",
        header: "Precio de Mercado",
        enableSorting: true,
        cell: ({ row }) => <div>{moneyParser(row.getValue("marketPrice"))}</div>,
        meta: {
            type: "number"
        }
    },
    {
        accessorKey: "lotSize",
        header: "Tamaño del Lote",
        enableSorting: true,
        cell: ({ row }) => <div className="lowercase">{row.getValue("lotSize")} m<sup>2</sup></div>,
        meta: {
            type: "number"
        }
    },
    {
        accessorKey: "yearBuilt",
        header: "Año de Construcción",
        enableSorting: true,
        cell: ({ row }) => <div className="lowercase">{row.getValue("yearBuilt")}</div>,
        meta: {
            type: "number"
        }
    },
    {
        id: "units",
        header: "Unidades",
        enableSorting: true,
        cell: ({ row }) => <div className="lowercase">{row?.original?.units?.length} unidad(es)</div>,
        meta: {
            type: "number"
        },
        accessorFn: (row) => row.units?.length || 0
    },
    {
        id: "createdAt",
        header: "Creado En",
        enableSorting: true,
        cell: ({ row }) => <div className="lowercase">{dateParser(row.getValue("createdAt"))}</div>,
        meta: {
            type: "date"
        },
        accessorFn: (row) => new Date(row.createdAt)
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const property = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(String(property.id))}
                        >
                            Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            //onClick={() => navigate(`/properties/${property.id}`)}
                        >Ver Propiedad</DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

// eslint-disable-next-line react/prop-types
const PropertyTable = ({ properties  }) => {

    return (
        <DataTable
            data={properties}
            columns={columns}
        />

    )

}

export default PropertyTable;