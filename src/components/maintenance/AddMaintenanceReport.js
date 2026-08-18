import {useState} from "react";
import {useGetUnitsQuery} from "../../services/api/unitApi.js";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogIcon, DialogTitle} from "../ui/dialog.tsx";
import {Button} from "../ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {maintenanceReportSchema} from "../../utils/formSchemas.js";
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import {MaintenanceStatus, Priority} from "../../utils/magicNumbers.js";
import {Textarea} from "../ui/textarea.tsx";
import LeaseSelection from "../comboboxes/LeaseSelection.js";
import TenantSelection from "../comboboxes/TenantSelection.js";
import {useGetTenantsQuery} from "../../services/api/tenantApi.js";
import {Drill, Flag} from "lucide-react";
import RentalSelection from "../comboboxes/RentalSelection.js";
import {useCreateMaintenanceReportMutation} from "../../services/api/maintenanceApi.js";

const AddMaintenanceReport = (props) => {
    const [open, setOpen] = useState(false)
    const {data: units} = useGetUnitsQuery();
    const {data: tenants} = useGetTenantsQuery();
    const [submitReport, {isLoading: isSubmitting}] = useCreateMaintenanceReportMutation();

    const maintenanceForm = useForm({
        resolver: zodResolver(maintenanceReportSchema),
        defaultValues: {
            unitId: "",
            title: "",
            status: "OPEN",
            priority: "",
            category: "",
            notes: "",
            reporterId: "",
        },
    })

    const onSubmit = (data) => {
        submitReport(data).then((res) => {
            if (res.data) {
                setOpen(false)
                maintenanceForm.reset();
            }
        })
    }

    return (
        <Dialog {...props} onOpenChange={() => setOpen(!open)} open={open}>
            <Button onClick={() => setOpen(!open)} variant="outline" type="button">
                {props.children}
            </Button>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <div className="space-y-4">
                    <DialogHeader>
                        <DialogIcon>
                            <Drill className="w-6 h-6"/>
                        </DialogIcon>
                        <DialogTitle>
                            Reportar Mantenimiento
                        </DialogTitle>
                        <DialogDescription>
                            Usa este formulario para crear un nuevo reporte de mantenimiento.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...maintenanceForm}>
                        <form
                            onSubmit={maintenanceForm.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormGroup asFlex>
                                <FormField
                                    control={maintenanceForm.control}
                                    name="title"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Título *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={maintenanceForm.control}
                                    name="category"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Monto *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="1000" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup asFlex>
                                <FormField
                                    control={maintenanceForm.control}
                                    name="status"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Estado *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar Estado"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                                    {Object.keys(MaintenanceStatus).map((status, index) => (
                                                        <SelectItem key={index} value={status}>
                                                            {MaintenanceStatus[status]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={maintenanceForm.control}
                                    name="priority"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Prioridad</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar Prioridad"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                                    <SelectItem key={"nothing"} value={null}>
                                                        <div className="h-4"/>
                                                    </SelectItem>
                                                    {Object.keys(Priority).map((status, index) => (
                                                        <SelectItem key={index} value={status}>
                                                            {Priority[status]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormField
                                control={maintenanceForm.control}
                                name="unitId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Unidad *</FormLabel>
                                        <FormControl>
                                            <RentalSelection 
                                                onSelect={(unitId) => {
                                                    maintenanceForm.setValue('unitId', unitId)
                                                    maintenanceForm.trigger('unitId')
                                                }} 
                                                selected={Number(maintenanceForm.getValues("unitId"))} 
                                                units={units?.data}
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={maintenanceForm.control}
                                name="reporterId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Reportado por</FormLabel>
                                        <FormControl>
                                            <TenantSelection 
                                                onSelect={(tenantId) => {
                                                    maintenanceForm.setValue('reporterId', tenantId)
                                                    maintenanceForm.trigger('reporterId')
                                                }} 
                                                selected={Number(maintenanceForm.getValues("reporterId"))}
                                                tenants={tenants?.data}
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                        <FormDescription>
                                            Si deseas reportar un problema de mantenimiento en nombre de un inquilino, puedes seleccionarlo aquí.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={maintenanceForm.control}
                                name="notes"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Notas</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Ingresa cualquier nota relevante aquí" 
                                                className="min-h-[100px]"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between gap-2 pt-4 sticky bottom-0 bg-background">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={() => {
                                        setOpen(false)
                                        maintenanceForm.reset();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="gradient" 
                                    className="w-full" 
                                    isLoading={isSubmitting}
                                >
                                    <Flag className="h-4 w-4 mr-2"/>
                                    Enviar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddMaintenanceReport;