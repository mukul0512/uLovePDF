import { getToolsInCategory, TOOL_CATEGORIES } from '@/constants/tools';
import { ToolCard } from './ToolCard';

/**
 * The full tool catalogue, grouped under category headings.
 *
 * The reference site uses filter tabs, which earn their keep across thirty
 * tools. With five, tabs would hide content behind an interaction and cost
 * us client-side JavaScript. Static headings are faster, fully crawlable,
 * and give screen-reader users real landmarks to navigate by.
 */
export function ToolGrid() {
  return (
    <div className="flex flex-col gap-10">
      {TOOL_CATEGORIES.map((category) => {
        const tools = getToolsInCategory(category.id);
        if (tools.length === 0) return null;

        return (
          <section key={category.id} aria-labelledby={`category-${category.id}`}>
            <h3 id={`category-${category.id}`} className="text-lg font-semibold tracking-tight">
              {category.label}
            </h3>
            <p className="text-muted mt-1 text-sm">{category.description}</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
