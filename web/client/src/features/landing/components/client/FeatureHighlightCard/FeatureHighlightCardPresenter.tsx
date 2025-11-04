import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface FeatureHighlightCardPresenterProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureHighlightCardPresenter(
  props: FeatureHighlightCardPresenterProps,
) {
  const { icon, title, description } = props;
  return (
    <Card className="h-full border-indigo-100 bg-white shadow-none transition hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="space-y-4">
        <span aria-hidden className="text-3xl">
          {icon}
        </span>
        <CardTitle className="text-lg font-semibold text-indigo-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed text-slate-600">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
