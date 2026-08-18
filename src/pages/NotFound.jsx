import {Button} from "../components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {BanIcon} from "lucide-react";

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col justify-start items-center h-[500px]">
            <div className="flex flex-col justify-start items-start gap-y-3 mt-12">
                <div className="text-2xl text-gray-900 font-600 flex flex-row items-center">
                    <BanIcon className="w-6 h-6 mr-4"/>
                    Página no encontrada
                </div>
                <div className="text-md text-gray-600">
                    Lo sentimos, la página que estás buscando no existe.
                </div>
                <Button variant="gradient" onClick={() => navigate("/")}>
                    Volver al inicio
                </Button>
            </div>

        </div>
    )
}

export default NotFound