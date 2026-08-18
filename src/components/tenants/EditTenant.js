import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {zodNumberInputPipe, zodStringPipe} from "../../utils/formatters.js";
import {
    Form,
    FormControl,
    FormDescription,
    FormField, FormGroup,
    FormItem,
    FormLabel,
    FormMessage,
    FormValue
} from "../ui/form.tsx";
import {Input} from "../ui/input.tsx";
import {Button} from "../ui/button.tsx";
import {useState} from "react";
import {Save} from "lucide-react";
import {CivilStatus} from "../../utils/magicNumbers.js";
import {useUpdateTenantMutation} from "../../services/api/tenantApi.js";
import {tenantSchema} from "../../utils/formSchemas.js";
import {isValidPhoneNumber} from "react-phone-number-input";

const EditTenant = ({tenant}) => {
    const [isEditing, setIsEditing] = useState(false);

    const [updateTenant, {isLoading: isUpdating}] = useUpdateTenantMutation();


    const tenantProfileSchema = z.object({
        firstName: zodStringPipe(z.string({errorMap: () => ({message: 'El nombre es requerido.'})})),
        lastName: zodStringPipe(z.string({errorMap: () => ({message: 'El apellido es requerido.'})})),
        email: zodStringPipe(z.string().email().or(z.null())),
        phone: zodStringPipe(z.string().refine(isValidPhoneNumber, { message: "Número de teléfono inválido" }).or(z.null())),
        civilStatus: zodStringPipe(z.string().or(z.null())),
        occupation: zodStringPipe(z.string().or(z.null())),
        income: zodNumberInputPipe(z.number({errorMap: () => ({message: 'Por favor, introduce un número válido.'})}).or(z.null())),
        creditScore: zodNumberInputPipe(z.number().positive('El número debe ser positivo')).or(z.null()),
    })

    const tenantProfileForm = useForm({
        resolver: zodResolver(tenantProfileSchema),
        defaultValues: {
            ...tenant,
        },
    })

    const onSubmit = (data) => {
        updateTenant({id: tenant.id, bodyData: data}).then(
            (res) => {
                if (!res.error) {
                    tenantProfileForm.reset(data)
                    setIsEditing(false)
                }
            }
        )
    }


    return (
        <div className="p-2">
            <Form {...tenantProfileForm}>
                <form onSubmit={tenantProfileForm.handleSubmit(onSubmit)} className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 justify-start">
                        <Button
                            variant={isEditing ? "outline" : "gradient"}
                            onClick={() => {
                                setIsEditing(!isEditing)
                                tenantProfileForm.reset()
                            }}
                            type="button"
                        >
                            {isEditing ? "Cancelar" : "Editar"}
                        </Button>

                        {isEditing && (
                            <Button type="submit" variant="gradient" isLoading={isUpdating}>
                                <Save className="w-4 h-4 mr-2"/>
                                Guardar
                            </Button>
                        )}

                    </div>

                    <FormGroup>
                        <FormField
                            control={tenantProfileForm.control}
                            name="firstName"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        {isEditing ?
                                            <Input placeholder="John" {...field} />
                                            :
                                            <FormValue>{field.value}</FormValue>
                                        }
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={tenantProfileForm.control}
                            name="lastName"
                            render={({field}) => (
                                <FormItem >
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                        {isEditing ?
                                            <Input placeholder="Doe" {...field} />
                                            :
                                            <FormValue>{field.value}</FormValue>
                                        }
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </FormGroup>


                    <FormField
                        control={tenantProfileForm.control}
                        name="email"
                        render={({field}) => (
                            <FormItem >
                                <FormLabel>Correo Electrónico</FormLabel>
                                <FormControl>
                                    {isEditing ?
                                        <Input placeholder="john.doe@mail.com" {...field} />
                                        :
                                        <FormValue>{field.value}</FormValue>
                                    }
                                </FormControl>
                                <FormMessage/>

                            </FormItem>
                        )}
                    />

                    <FormField
                        control={tenantProfileForm.control}
                        name="phone"
                        render={({field}) => (
                            <FormItem >
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    {isEditing ?
                                        <Input {...field} type="phone" />
                                        :
                                        <FormValue>{field.value}</FormValue>
                                    }
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                    <FormGroup>
                        <FormField
                            control={tenantProfileForm.control}
                            name="occupation"
                            render={({field}) => (
                                <FormItem >
                                    <FormLabel>Ocupación</FormLabel>
                                    <FormControl>
                                        {isEditing ?
                                            <Input {...field} placeholder="Enfermera" />
                                            :
                                            <FormValue>{field.value}</FormValue>
                                        }
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                        <FormField
                            control={tenantProfileForm.control}
                            name="civilStatus"
                            render={({field}) => (
                                <FormItem >
                                    <FormLabel>Estado Civil</FormLabel>
                                    <FormControl>
                                        {isEditing ?
                                            <select {...field} className="w-full" defaultValue={tenant.civilStatus || ""}>
                                                <option value=""
                                                    className="text-gray-400"
                                                >Seleccionar</option>
                                                {Object.keys(CivilStatus).map((status) => (
                                                    <option key={status} value={status}>{CivilStatus[status]}</option>
                                                ))}
                                            </select>
                                            :
                                            <FormValue>{CivilStatus[field.value]}</FormValue>
                                        }
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                    </FormGroup>


                    <FormGroup>
                        <FormField
                            control={tenantProfileForm.control}
                            name="income"
                            render={({field}) => (
                                <FormItem >
                                    <FormLabel>Ingresos</FormLabel>
                                    <FormControl>
                                        {isEditing ?
                                            <Input {...field} placeholder="50000" type="currency" />
                                            :
                                            <FormValue>{field.value}</FormValue>
                                        }
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                        <FormField
                            control={tenantProfileForm.control}
                            name="creditScore"
                            render={({field}) => (
                                <FormItem >
                                    <FormLabel>Puntaje de Crédito</FormLabel>
                                    <FormControl>
                                        {isEditing ?
                                            <Input {...field} placeholder="1000" type="number" />
                                            :
                                            <FormValue>{field.value}</FormValue>
                                        }
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                    </FormGroup>



                </form>
            </Form>
        </div>

    )
}

export default EditTenant;