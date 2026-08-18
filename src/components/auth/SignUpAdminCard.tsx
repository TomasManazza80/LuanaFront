import {useLoginMutation, useRegisterMutation} from "../../services/api/authApi.js";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../ui/form.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {Input} from "../ui/input.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "../ui/button.tsx";
import {useNavigate} from "react-router-dom";
import PublicAuthLayout from "./PublicAuthLayout.jsx";

export const SignUpAdminCard = () => {
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
        register({...data, role: 'ADMIN'}).then((res: any) => {
            if (res.data) {
                login({email: form.getValues('email'), password: form.getValues('password')}).then((res: any) => {
                    if (res.data) {
                        navigate("/dashboard")
                    }
                })
            }
        })
    }

    return (
        <PublicAuthLayout>
            <div className="text-center mb-6">
                <h1 className="text-3xl font-serif text-white mb-2">Crear Administrador</h1>
                <p className="text-white/60 text-sm">Registra una nueva cuenta con permisos administrativos</p>
            </div>

            <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-white/90">Correo electrónico</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="tu@email.com" 
                                        className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#b91c1c]" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white/90">Nombre</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Juan" 
                                            className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#b91c1c]" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white/90">Apellido</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Pérez" 
                                            className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#b91c1c]" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-white/90">Contraseña</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        className="bg-black/40 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#b91c1c]" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold mt-4" disabled={isLoading || loginIsLoading}>
                        {(isLoading || loginIsLoading) ? "Procesando..." : "Crear Administrador"}
                    </Button>

                    <div className="mt-4 text-center">
                        <Button variant="link" type="button" className="text-white/60 hover:text-[#b91c1c]" onClick={() => navigate("/login")}>
                            Volver al Inicio de Sesión
                        </Button>
                    </div>
                </form>
            </Form>
        </PublicAuthLayout>
    )
}
