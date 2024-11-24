type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextAreaResize({ ...props }: TextAreaProps) {
  return (
    <div
      className="
        grid
        text-sm
        after:px-3.5
        after:py-2.5
        [&>textarea]:text-inherit
        after:text-inherit
        [&>textarea]:resize-none
        [&>textarea]:overflow-hidden
        [&>textarea]:[grid-area:1/1/2/2]
        after:[grid-area:1/1/2/2]
        after:whitespace-pre-wrap
        after:invisible
        after:content-[attr(data-cloned-val)_'_']
      "
    >
      <textarea
        className="w-full text-slate-600 bg-slate-50 border border-transparent hover:border-slate-200 appearance-none rounded px-3.5 pt-1 pb-0 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        onInput={(e) => {
          e.currentTarget.parentNode!.dataset.clonedVal = e.currentTarget.value;
        }}
        {...props}
      />
    </div>
  );
}
