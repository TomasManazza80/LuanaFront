import {FactoryIcon, GemIcon, HomeIcon, LandPlot, StoreIcon, Tractor} from "lucide-react";
import {RiHomeOfficeLine} from "react-icons/ri";
import {BiBuildingHouse, BiQuestionMark} from "react-icons/bi";
import {MdApartment} from "react-icons/md";
import {LiaBuilding} from "react-icons/lia";
import {HiOutlineHomeModern} from "react-icons/hi2";

export const CurrencySymbol = {
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "AUD": "A$",
    "CAD": "C$",
    "CHF": "Fr",
    "CNY": "¥",
    "ARS": "$",
}

export const RentalStatus = {
    "RENTED": "Alquilado",
    "VACANT": "Vacante",
    "OCCUPIED": "Ocupado",
    "UNOCCUPIED": "Desocupado",
    "PENDING": "Pendiente",
    "UNKNOWN": "Desconocido",
}

export const CivilStatus = {
    "SINGLE": "Soltero/a",
    "MARRIED": "Casado/a",
    "DIVORCED": "Divorciado/a",
    "WIDOWED": "Viudo/a",
    "SEPARATED": "Separado/a",
    "OTHER": "Otro",
    "UNKNOWN": "Desconocido",
}

export const ListingStatus = {
    "ACTIVE": "Activo",
    "INACTIVE": "Inactivo",
    "RENTED": "Alquilado",
    "NOT_RENTED": "No Alquilado",
    "RESERVED": "Reservado",
    "SOLD": "Vendido",
    "PENDING": "Pendiente",
    "UNKNOWN": "Desconocido",
}

export const PaymentStatus = {
    "PAID": "Pagado",
    "PENDING": "Pendiente",
    "REPORTED": "Reportado",
    "CANCELLED": "Cancelado",
    "REJECTED": "Rechazado",
}

export const MaintenanceStatus = {
    "REPORTED": "Reportado",
    "IN_PROGRESS": "En Progreso",
    "COMPLETED": "Completado",
    "OPEN": "Abierto",
    "SCHEDULED": "Programado",
}

export const Priority = {
    "LOW": "Baja",
    "MEDIUM": "Media",
    "HIGH": "Alta",
    "CRITICAL": "Crítica",
}

export const PaymentScheduleStatus = {
    "SCHEDULED": "Programado",
    "PAID": "Pagado",
    "PARTIALLY_PAID": "Pago Parcial",
    "OVERDUE": "Vencido",
    "WAIVED": "Exonerado",
}

export const PaymentFrequency = {
    "MONTHLY": "Mensual",
    "WEEKLY": "Semanal",
    "QUARTERLY": "Trimestral",
    "ANNUALLY": "Anual",
}

export const LeaseStatus = {
    ACTIVE: "Activo",
    EXPIRED: "Expirado",
    TERMINATED: "Terminado",
    PENDING: "Pendiente",
}

export const RealEstateType = {
    "SINGLE_FAMILY_HOME": "Casa Unifamiliar",
    "MULTI_FAMILY_HOME": "Casa Multifamiliar",
    "CONDO": "Condominio",
    "APARTMENT": "Departamento",
    "TOWNHOUSE": "Casa Adosada",
    "LUXURY": "Lujo",
    "OFFICE": "Oficina",
    "RETAIL": "Local Comercial",
    "INDUSTRIAL": "Industrial",
    "LAND": "Terreno",
    "FARM": "Finca"
}

export const RoleNames = {
    "ADMIN": "Administrador",
    "USER": "Usuario",
    "TENANT": "Inquilino",
    "REALTOR": "Agente",
    "EMPLOYEE": "Empleado"
}


export const getRealEstateIcon = (type) => {
    const iconClass = "w-5 h-5 mr-1";
    const enumType = RealEstateType[type]
    switch (enumType) {
        case RealEstateType.SINGLE_FAMILY_HOME:
            return <HomeIcon className={iconClass}/>;
        case RealEstateType.MULTI_FAMILY_HOME:
            return <HiOutlineHomeModern className={iconClass}/>;
        case RealEstateType.CONDO:
            return <LiaBuilding className={iconClass}/>;
        case RealEstateType.APARTMENT:
            return <MdApartment className={iconClass}/>;
        case RealEstateType.TOWNHOUSE:
            return <BiBuildingHouse className={iconClass}/>;
        case RealEstateType.LUXURY:
            return <GemIcon className={iconClass}/>;
        case RealEstateType.OFFICE:
            return <RiHomeOfficeLine className={iconClass}/>;
        case RealEstateType.RETAIL:
            return <StoreIcon className={iconClass}/>;
        case RealEstateType.INDUSTRIAL:
            return <FactoryIcon className={iconClass}/>;
        case RealEstateType.LAND:
            return <LandPlot className={iconClass}/>;
        case RealEstateType.FARM:
            return <Tractor className={iconClass}/>;
        default:
            return <BiQuestionMark className={iconClass}/>;
    }
}


