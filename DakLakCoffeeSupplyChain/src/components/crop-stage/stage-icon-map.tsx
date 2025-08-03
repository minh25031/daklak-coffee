import {
    Plane,
    Flower2,
    Apple,
    Candy,
    ShoppingBasket,
    HelpCircle
} from "lucide-react";
import { JSX } from "react";

export const stageIconMap: Record<string, JSX.Element> = {
    PLANTING: (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 ml-1">
            <Plane className="h-4 w-4 text-green-600" />
        </div>
    ),
    FLOWERING: (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 ml-1">
            <Flower2 className="h-4 w-4 text-pink-500" />
        </div>
    ),
    FRUITING: (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 ml-1">
            <Apple className="h-4 w-4 text-red-500" />
        </div>
    ),
    RIPENING: (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 ml-1">
            <Candy className="h-4 w-4 text-yellow-600" />
        </div>
    ),
    HARVESTING: (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 ml-1">
            <ShoppingBasket className="h-4 w-4 text-amber-700" />
        </div>
    ),
};

export const fallbackIcon = (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 ml-1">
        <HelpCircle className="h-4 w-4 text-gray-400" />
    </div>
);
