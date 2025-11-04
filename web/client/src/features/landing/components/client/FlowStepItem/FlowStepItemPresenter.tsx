import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface FlowStepItemPresenterProps {
  step: string;
  title: string;
  description: string;
}

export function FlowStepItemPresenter(props: FlowStepItemPresenterProps) {
  const { step, title, description } = props;
  return (
    <li>
      <Card className="border-white/15 bg-white/5 backdrop-blur">
        <CardHeader className="flex flex-row items-start justify-between gap-4 text-white">
          <Badge
            variant="outline"
            className="border-white/40 bg-white/10 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          >
            {step}
          </Badge>
          <CardTitle className="text-base font-semibold text-white">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-indigo-100/80">
            {description}
          </p>
        </CardContent>
      </Card>
    </li>
  );
}
