import {
    ColumnDef,
} from "@tanstack/react-table";
import { dateParser } from "../../utils/formatters.js";
import { DataTable } from "../ui/data-table.js";
import { MaintenanceRequest } from "../../utils/classes.ts";
import { Drill, Trash2 } from "lucide-react";
import { MaintenanceStatus, Priority } from "../../utils/magicNumbers";
import { MaintenanceStatusBadge, PriorityBadge } from "../../utils/statusBadges";
import Link from "../general/Link.tsx";
import { Button } from "../ui/button.tsx";
import { useSelector } from 'react-redux';
import { store } from '../../services/store/store';
import { useEffect, useState } from "react";
import { message } from "antd";

// Este componente se moverá fuera para poder usarlo con los datos en estado
const createColumns = (handleDelete) => {
    const columns: ColumnDef<MaintenanceRequest>[] = [
        {
            id: "createdAt",
            header: "Creation Date",
            cell: ({ row }) => (
                <div className="capitalize">{dateParser(row?.original?.createdAt)}</div>
            ),
            meta: { type: "date" },
            accessorFn: (row) => new Date(row?.createdAt) || "",
            enableSorting: true,
        },
        {
            id: "title",
            header: "Title",
            cell: ({ row }) => <div className="capitalize">{row?.original?.title}</div>,
            meta: { type: "string" },
            accessorFn: (row) => row?.title || "",
            enableSorting: true,
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => <MaintenanceStatusBadge status={row?.original?.status} />,
            meta: { type: "enum", options: Object.values(MaintenanceStatus) },
            accessorFn: (row) => row?.status,
            enableSorting: true,
        },
        {
            id: "priority",
            header: "Priority",
            cell: ({ row }) => <PriorityBadge priority={row?.original?.priority} />,
            meta: { type: "enum", options: Object.values(Priority) },
            accessorFn: (row) => row?.priority,
            enableSorting: true,
        },
        {
            id: "unit",
            header: "Unit",
            cell: ({ row }) => {
                const unit = row.original?.unit;
                if (!unit) return <p className="text-red-600/90">No Unit</p>;
                return <Link id={unit.id} type={"unit"} />;
            },
            meta: { type: "number" },
            accessorFn: (row) => row?.unit?.unitIdentifier || "",
            enableSorting: true,
        },
        {
            id: "category",
            header: "Monto",
            cell: ({ row }) => <div className="capitalize">{row?.original?.category}</div>,
            meta: { type: "string" },
            accessorFn: (row) => row?.category || "",
            enableSorting: true,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(row.original.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            ),
            meta: { sticky: "right" },
        },
    ];
    return columns;
};

const MaintenanceTable = ({ maintenanceReports: initialReports, ...props }) => {
    const token = useSelector((state: ReturnType<typeof store.getState>) => state.authSlice.accessToken);
    const [maintenanceReports, setMaintenanceReports] = useState(initialReports || []);

    useEffect(() => {
        setMaintenanceReports(initialReports);
    }, [initialReports]);

    const handleDelete = async (id: number) => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
            };
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";
            const response = await fetch(`${apiUrl}/maintenance/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                throw new Error("Error al eliminar el reporte");
            }

            // Actualiza la tabla quitando el elemento eliminado
            setMaintenanceReports(prev => prev.filter(item => item.id !== id));

            // Muestra mensaje de éxito
            message.success("Reporte eliminado correctamente");
        } catch (error) {
            console.error('Error al eliminar la fila:', error);
            message.error("Error al eliminar el reporte");
        }
    };

    return (
        <div className={"border-2 border-border p-4 rounded-lg"}>
            <DataTable
                data={maintenanceReports}
                columns={createColumns(handleDelete)}
                defaultSort={{ id: "createdAt", desc: true }}
                title="Reporte de Mantenimiento"
                subtitle="todos los reportes de mantenimiento"
                icon={<Drill className={"w-5 h-5"} />}
                {...props}
            >
                {props.children}
            </DataTable>
        </div>
    );
};

export default MaintenanceTable;
