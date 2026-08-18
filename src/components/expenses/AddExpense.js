import {useState} from "react";
import {useGetUnitsQuery} from "../../services/api/unitApi.js";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogIcon, DialogTitle} from "../ui/dialog.tsx";
import {Button} from "../ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {expenseSchema} from "../../utils/formSchemas.js";
import {
    Form,
    FormControl,
    FormField,
    FormGroup,
    FormItem,
    FormLabel,
    FormMessage
} from "../ui/form.tsx";
import {Input} from "../ui/input.tsx";
import {Textarea} from "../ui/textarea.tsx";
import LeaseSelection from "../comboboxes/LeaseSelection.js";
import {ExternalLink, FilePlus2, Plus} from "lucide-react";
import RentalSelection from "../comboboxes/RentalSelection.js";
import {useGetLeasesQuery} from "../../services/api/leaseApi.js";
import {useCreateExpenseMutation} from "../../services/api/financialsApi.js";

const AddExpense = (props) => {
    const [open, setOpen] = useState(false);
    const {data: units} = useGetUnitsQuery();
    const {data: leases} = useGetLeasesQuery();
    const [createExpense, {isLoading: isCreating}] = useCreateExpenseMutation();

    const expenseForm = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            title: "",
            amount: "",
            category: "",
            date: "",
            unitId: null,
            leaseId: null,
            maintenanceRequestId: null,
            notes: "",
            description: "",
        },
    });

    const onSubmit = (data) => {
        // Aquí puedes asegurarte de que el 'amount' se maneje como un número
        // antes de enviarlo, si es que el input lo devuelve como string.
        const formattedData = {
            ...data,
            amount: parseFloat(data.amount), // Convertir a número flotante
        };
        createExpense(formattedData).then((res) => {
            if (res.data) {
                setOpen(false);
                expenseForm.reset();
            }
        });
    };

    return (
        <Dialog {...props} onOpenChange={() => setOpen(!open)} open={open}>
            <Button onClick={() => setOpen(!open)} variant="outline" type="button">
                <FilePlus2 className="h-4 w-4 mr-2"/>
                Agregar Gasto
            </Button>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogIcon>
                        <ExternalLink className="w-6 h-6"/>
                    </DialogIcon>
                    <DialogTitle>
                        Agregar Gasto
                    </DialogTitle>
                    <DialogDescription>
                        Agrega un nuevo gasto al sistema
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1">
                    <Form {...expenseForm}>
                        <form
                            onSubmit={expenseForm.handleSubmit(onSubmit)}
                            className="flex flex-col gap-2"
                        >
                            <FormGroup asFlex>
                                <FormField
                                    control={expenseForm.control}
                                    name="title"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Nombre Inquilino</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Inquilino" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                control={expenseForm.control}
                                name="description"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Servicio</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Ej. Costos de servicio de Agua" 
                                                className="resize-none min-h-[50px]" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                                <FormField
                                    control={expenseForm.control}
                                    name="category"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Categoría</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mantenimiento" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormField
                                    control={expenseForm.control}
                                    name="date"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Vencimiento *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={expenseForm.control}
                                    name="amount"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Monto *</FormLabel>
                                            <FormControl>
                                                {/* El 'type="number"' es importante para la validación del navegador */}
                                                {/* Aquí se podría añadir un prefijo 'ARS' en el placeholder o como texto adyacente */}
                                                <Input type="number" placeholder="Ej: 1500.50" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormField
                                    control={expenseForm.control}
                                    name="unitId"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Unidad</FormLabel>
                                            <FormControl>
                                                <RentalSelection 
                                                    onSelect={(unitId) => {
                                                        expenseForm.setValue('unitId', unitId);
                                                        expenseForm.trigger('unitId');
                                                    }} 
                                                    selected={Number(expenseForm.getValues("unitId"))} 
                                                    units={units?.data}
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={expenseForm.control}
                                    name="leaseId"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Contrato de Alquiler</FormLabel>
                                            <FormControl>
                                                <LeaseSelection 
                                                    onSelect={(leaseId) => {
                                                        expenseForm.setValue('leaseId', leaseId);
                                                        expenseForm.trigger('firstName');
                                                    }} 
                                                    selected={Number(expenseForm.getValues("leaseId"))} 
                                                    leases={leases?.data}
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            

                            <FormField
                                control={expenseForm.control}
                                name="notes"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Notas</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Ingresa cualquier nota relevante aquí"  
                                                className="resize-none min-h-[50px]" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between gap-2 mt-4 sticky bottom-0 bg-background py-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={() => {
                                        setOpen(false);
                                        expenseForm.reset();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="gradient" 
                                    className="w-full" 
                                    isLoading={isCreating}
                                >
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Enviar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddExpense;