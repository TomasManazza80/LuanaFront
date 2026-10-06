import {useLoginMutation} from "../../services/api/authApi.js";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../ui/form.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {Input} from "../ui/input.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "../ui/button.tsx";
import {useNavigate} from "react-router-dom";
import PublicAuthLayout from "./PublicAuthLayout.jsx";
import { Loader2 } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";

const LoginCard = () => {
    const navigate = useNavigate();
    const [login, {isLoading}] = useLoginMutation();
    const { accessToken, user } = useSelector(state => state.authSlice);

    React.useEffect(() => {
        if (accessToken) {
            const role = (user?.role || '').toUpperCase();
            if (role === 'ADMIN' || role === 'EMPLOYEE') {
                navigate('/dashboard');
            } else {
                navigate('/reservar');
            }
        }
    }, [accessToken, user, navigate]);

    const loginFormSchema = z.object({
        email: z.string().email({message: 'Por favor, introduce un correo electrónico válido'}),
        password: z.string().min(6, {message: 'La contraseña debe tener al menos 6 caracteres'}),
    })

    const form = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    function onSubmit(zodValues) {
        login(zodValues).then((res) => {
            if (res.data) {
                let role = 'USER';
                if (res.data.user && res.data.user.role) {
                    role = String(res.data.user.role).toUpperCase();
                } else if (res.data.accessToken) {
                    try {
                        const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]));
                        role = payload.role ? String(payload.role).toUpperCase() : 'USER';
                    } catch (e) {
                        console.error('Error decoding token', e);
                    }
                }

                if (role === 'ADMIN' || role === 'EMPLOYEE') {
                    navigate('/dashboard')
                } else {
                    navigate('/reservar')
                }
            } else if (res.error) {
                form.setError("password", { message: "Correo electrónico o contraseña incorrectos." });
            }
        })
    }

    return (
        <PublicAuthLayout>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-[#3D1A20] font-serif uppercase tracking-tight mb-2">Iniciar Sesión</h1>
                <p className="text-[#3D1A20]/70 text-sm font-medium">Bienvenido al sistema de administración</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-[#3D1A20] font-bold text-xs uppercase tracking-wider">Correo electrónico</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="tu@email.com" 
                                        className="bg-[#F3ECE7] border-[#E5D8CC] text-[#3D1A20] placeholder:text-[#3D1A20]/40 focus-visible:ring-[#3D1A20] focus-visible:border-[#3D1A20] rounded-xl px-4 py-3 h-auto shadow-inner" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-[#3D1A20] font-bold text-xs uppercase tracking-wider">Contraseña</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="password" 
                                        placeholder="••••••••"
                                        className="bg-[#F3ECE7] border-[#E5D8CC] text-[#3D1A20] placeholder:text-[#3D1A20]/40 focus-visible:ring-[#3D1A20] focus-visible:border-[#3D1A20] rounded-xl px-4 py-3 h-auto shadow-inner tracking-widest" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-[#3D1A20] hover:bg-[#2E1318] text-[#F3ECE7] font-bold py-6 rounded-xl mt-4 transition-all shadow-xl hover:shadow-[#3D1A20]/30 hover:-translate-y-0.5 uppercase tracking-widest text-xs" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                        {isLoading ? "Iniciando..." : "Ingresar"}
                    </Button>

                    <div className="mt-6 text-center">
                        <Button variant="link" type="button" className="text-[#3D1A20]/70 hover:text-[#3D1A20] font-bold text-xs uppercase tracking-wider" onClick={() => navigate("/signup")}>
                            ¿No tienes una cuenta? Regístrate
                        </Button>
                    </div>
                </form>
            </Form>
        </PublicAuthLayout>
    )
}

export default LoginCard;