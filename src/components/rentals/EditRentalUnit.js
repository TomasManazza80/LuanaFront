import {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogIcon,
    DialogTitle,
} from "../ui/dialog.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {unitSchema} from "../../utils/formSchemas.js";
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
import {Building} from "lucide-react";
import {Input} from "../ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import {ListingStatus} from "../../utils/magicNumbers.js";
import {Button} from "../ui/button.tsx";
import {useUpdateUnitMutation} from "../../services/api/unitApi.js";

const EditRentalUnit = ({unit, open, setOpen, ...props}) => {
    const rentalForm = useForm({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            ...unit
        }
    });

    const [updateUnit, {isLoading: isUpdating}] = useUpdateUnitMutation();

    const handleSubmit = (data) => {
        const body = {...data};
        // Remove information wasn't changed
        Object.keys(body).forEach(key => {
            if (body[key] === unit[key]) {
                delete body[key];
            }
        });
        body.id = unit.id;

        updateUnit(body).then((res) => {
            if (res.error) {
                console.log(res.error);
            } else {
                setOpen(false);
                // Update the form with the new data
                rentalForm.reset(body);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogIcon>
                        <Building className="w-6 h-6" />
                    </DialogIcon>
                    <DialogTitle>
                        Editar Unidad ({unit.unitIdentifier})
                    </DialogTitle>
                    <DialogDescription>
                        Edita la información general de esta unidad.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1">
                    <Form {...rentalForm}>
                        <form onSubmit={rentalForm.handleSubmit(handleSubmit)} className="flex flex-col gap-2">
                            <FormField
                                control={rentalForm.control}
                                name="unitIdentifier"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Identificador de Unidad *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                        <FormDescription>
                                            Este es el identificador único para la unidad
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            <FormGroup>
                                <FormField
                                    control={rentalForm.control}
                                    name="unitNumber"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Número de Unidad</FormLabel>
                                            <FormControl>
                                                <Input placeholder="3A" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={rentalForm.control}
                                    name="floor"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Piso</FormLabel>
                                            <FormControl>
                                                <Input placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormField
                                    control={rentalForm.control}
                                    name="numOfFloors"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Pisos</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="2" type="number"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={rentalForm.control}
                                    name="numOfRooms"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Habitaciones</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="6" type="number"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={rentalForm.control}
                                    name="unitSize"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Tamaño de la Unidad</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="100" type="number"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormField
                                    control={rentalForm.control}
                                    name="numOfBedrooms"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Dormitorios</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="2" type="number"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={rentalForm.control}
                                    name="numOfBathrooms"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Baños</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="1" type="number"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={rentalForm.control}
                                    name="garages"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Garajes</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="2" type="number"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <FormGroup>
                                <FormField
                                    control={rentalForm.control}
                                    name="status"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar..."/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {
                                                        Object.keys(ListingStatus).map((status, index) => {
                                                            return (
                                                                <SelectItem key={index}
                                                                            value={status}>{ListingStatus[status]}</SelectItem>
                                                            )
                                                        })
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={rentalForm.control}
                                    name="rentalPrice"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Precio de Alquiler</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="2000" type="currency"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </FormGroup>

                            <div className="w-full flex flex-row gap-2 justify-between mt-2 sticky bottom-0 bg-background py-2">
                                <Button 
                                    variant="outline" 
                                    type="reset" 
                                    onClick={() => {
                                        setOpen(false);
                                        rentalForm.reset();
                                    }}
                                    disabled={isUpdating}
                                    className="w-full"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    variant="gradient" 
                                    type="submit"
                                    isLoading={isUpdating}
                                    disabled={isUpdating}
                                    className="w-full"
                                >
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditRentalUnit;