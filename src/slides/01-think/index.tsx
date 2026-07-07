import thinkUrl from "./think.svg";
import thinkGraffitiUrl from "./think-graffiti.svg";
import mustChangeUrl from "./must-change.svg";
import howYouUrl from "./how-you.svg";


export function ThinkSlide({ className = "" }: { className?: string }) {
    return (
        <div className={`${className}`.trim()}>
            <img alt="" aria-hidden="true" className="absolute -top-1 -left-1 h-[20%]" src={howYouUrl} />
            <img alt="" aria-hidden="true" className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-[48%] w-[70%]" src={thinkGraffitiUrl} />
            <img alt="" aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68%]" src={thinkUrl} />
            <img alt="" aria-hidden="true" className="absolute -bottom-1 -right-1 h-[20%]" src={mustChangeUrl} />
        </div>
    );
}