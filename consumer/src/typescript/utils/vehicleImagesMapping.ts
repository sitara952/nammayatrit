import { ImageSourcePropType } from 'react-native';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';

import mtIcAmbassador from '../assets/vehicleImages/mt_ic_ambassador.webp';
import mtIcBenz from '../assets/vehicleImages/mt_ic_benz.webp';
import mtIcCiaz from '../assets/vehicleImages/mt_ic_ciaz.webp';
import mtIcErtiga from '../assets/vehicleImages/mt_ic_ertiga.webp';
import mtIcEtios from '../assets/vehicleImages/mt_ic_etios.webp';
import mtIcGlanza from '../assets/vehicleImages/mt_ic_glanza.webp';
import mtIcIndica from '../assets/vehicleImages/mt_ic_indica.webp';
import mtIcInnova from '../assets/vehicleImages/mt_ic_innova.webp';
import mtIcSunny from '../assets/vehicleImages/mt_ic_sunny.webp';
import mtIcTigor from '../assets/vehicleImages/mt_ic_tigor.webp';
import mtIcXylo from '../assets/vehicleImages/mt_ic_xylo.webp';
import mtIcBikeRiderCard from '../assets/vehicleImages/mt_ic_bike_rider_card.webp';
import nyIcBikeDeliveryConcept from '../assets/ny-service/ny_ic_bike_delivery_concept.webp';
import mtIcXlCabAcRight from '../assets/vehicleImages/mt_ic_xl_cab_ac_right.webp';
import mtIcXlCabRight from '../assets/vehicleImages/mt_ic_xl_cab_right.webp';
import mtIcSedanAcRight from '../assets/vehicleImages/mt_ic_sedan_ac_right.webp';
import mtIcSedanRight from '../assets/vehicleImages/mt_ic_sedan_right.webp';
import mtIcXlPlusAcRight from '../assets/vehicleImages/mt_ic_xl_plus_ac_right.webp';
import mtIcXlPlusRight from '../assets/vehicleImages/mt_ic_xl_plus_right.webp';
import mtIcAcMini from '../assets/vehicleImages/mt_ic_ac_mini.webp';
import mtIcNonAcMini from '../assets/vehicleImages/mt_ic_non_ac_mini.webp';
import mtIcBikeRight from '../assets/vehicleImages/mt_ic_bike_right.webp';
import mtIcAutoRight from '../assets/vehicleImages/mt_ic_auto_right.webp';
import mtIcAmaze from '../assets/vehicleImages/mt_ic_amaze.webp';
import mtIcEon from '../assets/vehicleImages/mt_ic_eon.webp';
import mtIcBolt from '../assets/vehicleImages/mt_ic_bolt.webp';
import mtIcKia from '../assets/vehicleImages/mt_ic_kia.webp';
import mtIcMarazzo from '../assets/vehicleImages/mt_ic_marazzo.webp';
import mtIcDatsun from '../assets/vehicleImages/mt_ic_datson.webp';
import mtIcFronx from '../assets/vehicleImages/mt_ic_fronx.webp';
import mtIcTavera from '../assets/vehicleImages/mt_ic_tavera.webp';
import mtIcEnjoy from '../assets/vehicleImages/mt_ic_enjoy.webp';
import mtIcDlite from '../assets/vehicleImages/mt_ic_dlite.webp';
import mtIcVerito from '../assets/vehicleImages/mt_ic_verito.webp';
import mtICBolero from '../assets/vehicleImages/mt_ic_bolero.webp';
import mtIcZest from '../assets/vehicleImages/mt_ic_zest.webp';
import mtIcManza from '../assets/vehicleImages/mt_ic_manza.webp';
import mtIcCity from '../assets/vehicleImages/mt_ic_city.webp';
import mtIcI20 from '../assets/vehicleImages/mt_ic_i20.webp';
import mtIcDatsunGo from '../assets/vehicleImages/mt_ic_datson_go.webp';
import mtIcVista from '../assets/vehicleImages/mt_ic_vista.webp';
import mtIcKwid from '../assets/vehicleImages/mt_ic_kwid.webp';
import mtIcSantro from '../assets/vehicleImages/mt_ic_santro.webp';
import mtIcMicra from '../assets/vehicleImages/mt_ic_micra.webp';
import mtIcSail from '../assets/vehicleImages/mt_ic_sail.webp';
import mtIcBrezza from '../assets/vehicleImages/mt_ic_brezza.webp';
import mtIcFiesta from '../assets/vehicleImages/mt_ic_fiesta.webp';
import mtIcAlto from '../assets/vehicleImages/mt_ic_alto.webp';
import mtIcCelerio from '../assets/vehicleImages/mt_ic_celerio.webp';
import mtIcI10 from '../assets/vehicleImages/mt_ic_i10.webp';
import mtIcSprsso from '../assets/vehicleImages/mt_ic_spresso.webp';
import mtIcSwift from '../assets/vehicleImages/mt_ic_swift.webp';
import mtIcDesire from '../assets/vehicleImages/mt_ic_desire.webp';
import mtIcWagonr from '@/typescript/assets/vehicleImages/mt_ic_wagonr.webp';
import mtIcAura from '../assets/vehicleImages/mt_ic_aura.webp';
import mtIcXcent from '../assets/vehicleImages/mt_ic_xcent.webp';
import mtIcAspire from '../assets/vehicleImages/mt_ic_aspire.webp';
import mtIcBaleno from '../assets/vehicleImages/mt_ic_baleno.webp';
import mtIcRitz from '../assets/vehicleImages/mt_ic_ritz.webp';
import mtIcLodgy from '../assets/vehicleImages/mt_ic_lodgy.webp';
import mtIcRumion from '../assets/vehicleImages/mt_ic_rumion.webp';
import mtIcFigo from '../assets/vehicleImages/mt_ic_figo.webp';
import mtIcXpresT from '../assets/vehicleImages/mt_ic_xpres_t.webp';
import mtIcTiber from '../assets/vehicleImages/mt_ic_tiber.webp';
import mtIcAuto from '../assets/vehicleImages/mt_ic_auto_real.webp';
import ysIcHeritageWagonR from '../assets/vehicleImages/ys_ic_heritage_cab_wagonr.webp';
import nyIcAmbulanceLeft from '../assets/vehicleImages/ny_ic_ambulance_left_side.webp';
import mtIcBikePlus from '../assets/vehicleImages/mt_ic_bike_plus.webp';
import mtIcBikePlusLeft from '../assets/vehicleImages/mt_ic_bike_plus_left.webp';
import mtIcACPriority from '../assets/vehicleImages/mt_ic_priority_cab.webp';
import mtIcAutoErickshaw from '../assets/vehicleImages/mt_ic_e_rickshaw.webp';
import mtIcAutoPriority from '../assets/vehicleImages/mt_ic_auto_priority.webp';
import mtIcAutoErickshawLeft from '../assets/vehicleImages/mt_ic_e_rickshaw_left.webp';

// Type Safe mapping for vehicle models
export const VEHICLE_MODEL_MAP: Record<string, ImageSourcePropType> = {
    alto: mtIcAlto,
    ambassador: mtIcAmbassador,
    aura: mtIcAura,
    benz: mtIcBenz,
    celerio: mtIcCelerio,
    ciaz: mtIcCiaz,
    dzire: mtIcDesire,
    ertiga: mtIcErtiga,
    etios: mtIcEtios,
    glanza: mtIcGlanza,
    i10: mtIcI10,
    indica: mtIcIndica,
    innova: mtIcInnova,
    's-presso': mtIcSprsso,
    sunny: mtIcSunny,
    swift: mtIcSwift,
    tigor: mtIcTigor,
    wagonr: mtIcWagonr,
    xcent: mtIcXcent,
    xylo: mtIcXylo,
    amaze: mtIcAmaze,
    eon: mtIcEon,
    bolt: mtIcBolt,
    kia: mtIcKia,
    marazzo: mtIcMarazzo,
    redi: mtIcDatsun,
    fronx: mtIcFronx,
    tavera: mtIcTavera,
    enjoy: mtIcEnjoy,
    dlite: mtIcDlite,
    verito: mtIcVerito,
    bolero: mtICBolero,
    zest: mtIcZest,
    manza: mtIcManza,
    city: mtIcCity,
    i20: mtIcI20,
    datson: mtIcDatsunGo,
    vista: mtIcVista,
    kwid: mtIcKwid,
    santro: mtIcSantro,
    micra: mtIcMicra,
    sail: mtIcSail,
    brezza: mtIcBrezza,
    fiesta: mtIcFiesta,
    aspire: mtIcAspire,
    baleno: mtIcBaleno,
    ritz: mtIcRitz,
    tour: mtIcWagonr,
    lodgy: mtIcLodgy,
    rumion: mtIcRumion,
    figo: mtIcFigo,
    'xpress-t': mtIcXpresT,
    tiber: mtIcTiber,
    heritage: mtIcWagonr,
};

export const SERVICE_TYPE_MAP: Record<ServiceTierType_serviceTierType, ImageSourcePropType> = {
    SUV: mtIcErtiga,
    SEDAN: mtIcDesire,
    PREMIUM_SEDAN: mtIcDesire,
    TAXI_PLUS: mtIcDesire,
    COMFY: mtIcDesire,
    PREMIUM: mtIcDesire,
    BLACK: mtIcDesire,
    SUV_PLUS: mtIcInnova,
    BLACK_XL: mtIcInnova,
    HATCHBACK: mtIcAlto,
    TAXI: mtIcAlto,
    ECO: mtIcAlto,
    BIKE: mtIcBikeRiderCard,
    DELIVERY_BIKE: nyIcBikeDeliveryConcept,
    AUTO_RICKSHAW: mtIcAuto,
    AMBULANCE_TAXI: nyIcAmbulanceLeft, // Placeholder image
    AMBULANCE_TAXI_OXY: nyIcAmbulanceLeft, // Placeholder image
    AMBULANCE_AC: nyIcAmbulanceLeft, // Placeholder image
    AMBULANCE_AC_OXY: nyIcAmbulanceLeft, // Placeholder image
    AMBULANCE_VENTILATOR: nyIcAmbulanceLeft, // Placeholder image
    DELIVERY_LIGHT_GOODS_VEHICLE: mtIcAuto, // Placeholder image
    HERITAGE_CAB: mtIcDesire, // Placeholder image
    EV_AUTO_RICKSHAW: mtIcAuto,
    AUTO_PLUS: mtIcAutoPriority,
    UNKNOWN_SERVICE_TYPE: mtIcAuto,
    BIKE_PLUS: mtIcBikePlusLeft,
    AC_PRIORITY: mtIcACPriority,
    E_RICKSHAW: mtIcAutoErickshawLeft,
};

export const VEHICLE_TYPE_AC_MAP: Record<
    ServiceTierType_serviceTierType,
    { ac: ImageSourcePropType; nonAc: ImageSourcePropType }
> = {
    SUV: { ac: mtIcXlCabAcRight, nonAc: mtIcXlCabRight },
    SEDAN: { ac: mtIcSedanAcRight, nonAc: mtIcSedanRight },
    PREMIUM_SEDAN: { ac: mtIcSedanAcRight, nonAc: mtIcSedanRight },
    TAXI_PLUS: { ac: mtIcSedanAcRight, nonAc: mtIcSedanRight },
    COMFY: { ac: mtIcSedanAcRight, nonAc: mtIcSedanRight },
    PREMIUM: { ac: mtIcSedanAcRight, nonAc: mtIcSedanRight },
    BLACK: { ac: mtIcSedanAcRight, nonAc: mtIcSedanRight },
    SUV_PLUS: { ac: mtIcXlPlusAcRight, nonAc: mtIcXlPlusRight },
    BLACK_XL: { ac: mtIcXlPlusAcRight, nonAc: mtIcXlPlusRight },
    HATCHBACK: { ac: mtIcAcMini, nonAc: mtIcNonAcMini },
    TAXI: { ac: mtIcAcMini, nonAc: mtIcNonAcMini },
    ECO: { ac: mtIcAcMini, nonAc: mtIcNonAcMini },
    BIKE: { ac: mtIcBikeRight, nonAc: mtIcBikeRight },
    DELIVERY_BIKE: { ac: mtIcBikeRight, nonAc: mtIcBikeRight },
    AUTO_RICKSHAW: { ac: mtIcAutoRight, nonAc: mtIcAutoRight },
    AMBULANCE_TAXI: { ac: nyIcAmbulanceLeft, nonAc: nyIcAmbulanceLeft }, // Placeholder image
    AMBULANCE_TAXI_OXY: { ac: nyIcAmbulanceLeft, nonAc: nyIcAmbulanceLeft }, // Placeholder image
    AMBULANCE_AC: { ac: nyIcAmbulanceLeft, nonAc: nyIcAmbulanceLeft }, // Placeholder image
    AMBULANCE_AC_OXY: { ac: nyIcAmbulanceLeft, nonAc: nyIcAmbulanceLeft }, // Placeholder image
    AMBULANCE_VENTILATOR: { ac: nyIcAmbulanceLeft, nonAc: nyIcAmbulanceLeft }, // Placeholder image
    DELIVERY_LIGHT_GOODS_VEHICLE: { ac: mtIcAuto, nonAc: mtIcAuto }, // Placeholder image
    HERITAGE_CAB: { ac: mtIcSedanAcRight, nonAc: mtIcSedanRight },
    EV_AUTO_RICKSHAW: { ac: mtIcAuto, nonAc: mtIcAuto },
    AUTO_PLUS: { ac: mtIcAutoPriority, nonAc: mtIcAutoPriority },
    UNKNOWN_SERVICE_TYPE: { ac: mtIcAuto, nonAc: mtIcAuto },
    BIKE_PLUS: { ac: mtIcBikePlus, nonAc: mtIcBikePlus },
    AC_PRIORITY: { ac: mtIcACPriority, nonAc: mtIcACPriority },
    E_RICKSHAW: { ac: mtIcAutoErickshaw, nonAc: mtIcAutoErickshaw },
};
/*
    This SERVICE_TYPE_VEHICLE_MAPPING is to fetch specific vehicle icons based on
    serviceTierTypes, each serviceTierType can contain specific vehicleModal
*/
export const SERVICE_TYRE_VEHICLE_MAPPING: Partial<
    Record<ServiceTierType_serviceTierType, { [key: string]: ImageSourcePropType }>
> = {
    HERITAGE_CAB: {
        wagonr: ysIcHeritageWagonR,
    },
};

/**
 * Get all available service tier types that are supported in the frontend
 * This is used to filter out variants that don't have corresponding images or support
 */
export const getAvailableServiceTierTypes = (): ServiceTierType_serviceTierType[] => {
    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    return Object.keys(SERVICE_TYPE_MAP) as ServiceTierType_serviceTierType[];
};

/**
 * Check if a service tier type is available in the frontend
 * @param serviceTierType - The service tier type to check
 * @returns true if the service tier type is available, false otherwise
 */
export const isServiceTierTypeAvailable = (
    serviceTierType: string,
): serviceTierType is ServiceTierType_serviceTierType => {
    return serviceTierType in SERVICE_TYPE_MAP;
};
