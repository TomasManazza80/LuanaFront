import {useLoginMutation, useRegisterMutation} from "../../services/api/authApi.js";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../ui/form.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {Input} from "../ui/input.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "../ui/button.tsx";
import {useNavigate} from "react-router-dom";
import PublicAuthLayout from "./PublicAuthLayout.jsx";
import { Loader2 } from "lucide-react";

export const SignUpCard = () => {
    const navigate = useNavigate();
    const [register, {isLoading}] = useRegisterMutation();
    const [login, {isLoading: loginIsLoading }] = useLoginMutation();

    const signUpFormSchema = z.object({
        email: z.string().email( {message: 'Introduce un correo válido'}),
        password: z.string().min(8, {message: 'La contraseña debe tener al menos 8 caracteres'}),
        first_name: z.string().min(1, {message: 'Ingresa tu nombre'}),
        last_name: z.string().min(1, {message: 'Ingresa tu apellido'}),
    }).superRefine(({ password }, checkPassComplexity) => {
        const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
        const containsLowercase = (ch: string) => /[a-z]/.test(ch);
        const containsSpecialChar = (ch: string) =>
            /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
        let countOfUpperCase = 0,
            countOfLowerCase = 0,
            countOfNumbers = 0,
            countOfSpecialChar = 0;
        for (let i = 0; i < password.length; i++) {
            const ch = password.charAt(i);
            if (!isNaN(+ch)) countOfNumbers++;
            else if (containsUppercase(ch)) countOfUpperCase++;
            else if (containsLowercase(ch)) countOfLowerCase++;
            else if (containsSpecialChar(ch)) countOfSpecialChar++;
        }
        if (
            countOfLowerCase < 1 ||
            countOfUpperCase < 1 ||
            countOfNumbers < 1
        ) {
            checkPassComplexity.addIssue({
                code: "custom",
                path: ["password"],
                message: "Usa al menos una mayúscula, una minúscula y un número",
            });
        }
    });

    const form = useForm({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            email: '',
            first_name: '',
            last_name: '',
            password: '',
        }
    })

    function onSubmit(data) {
        register({...data, role: 'USER'}).then((res: any) => {
            if (res.data) {
                login({email: form.getValues('email'), password: form.getValues('password')}).then((res: any) => {
                    if (res.data) {
                        navigate("/reservar")
                    }
                })
            }
        })
    }

    return (
        <PublicAuthLayout>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
                <p className="text-gray-500 text-sm">Registra tus datos para acceder al sistema</p>
            </div>

            <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-semibold">Correo electrónico</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="tu@email.com" 
                                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#0a47d4] focus-visible:border-[#0a47d4] rounded-xl px-4 py-3 h-auto" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">Nombre</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Juan" 
                                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#0a47d4] focus-visible:border-[#0a47d4] rounded-xl px-4 py-3 h-auto" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">Apellido</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Pérez" 
                                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#0a47d4] focus-visible:border-[#0a47d4] rounded-xl px-4 py-3 h-auto" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-semibold">Contraseña</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#0a47d4] focus-visible:border-[#0a47d4] rounded-xl px-4 py-3 h-auto" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-[#0a47d4] hover:bg-blue-700 text-white font-bold py-6 rounded-xl mt-4 transition-colors shadow-md shadow-blue-500/20" disabled={isLoading || loginIsLoading}>
                        {(isLoading || loginIsLoading) ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                        {(isLoading || loginIsLoading) ? "Procesando..." : "Registrarse"}
                    </Button>

                    <div className="mt-6 text-center space-y-3 flex flex-col items-center">
                        <Button variant="link" type="button" className="text-gray-500 hover:text-[#0a47d4] font-medium" onClick={() => navigate("/login")}>
                            ¿Ya tienes una cuenta? Inicia sesión
                        </Button>
                        <Button variant="link" type="button" className="text-gray-400 text-xs hover:text-[#0a47d4]" onClick={() => navigate("/signup-admin")}>
                            Crear cuenta de Administrador
                        </Button>
                    </div>
                </form>
            </Form>
        </PublicAuthLayout>
    )
}
