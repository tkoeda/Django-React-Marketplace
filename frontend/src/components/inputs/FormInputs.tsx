interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

function TextInput({ label, id, ...props }: TextInputProps): JSX.Element {
    return (
        <section className="listing-form__input-group">
            <label>
                <div className="form-group-title">
                    <span>{label}</span>
                </div>
                <input id={id} {...props} />
            </label>
        </section>
    );
}

interface TextAreaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

function TextArea({ label, id, ...props }: TextAreaProps): JSX.Element {
    return (
        <section className="listing-form__input-group">
            <label>
                <div className="form-group-title">
                    <span>{label}</span>
                </div>
                <textarea id={id} {...props}></textarea>
            </label>
        </section>
    );
}

interface SelectOption {
    value: string;
    label: string;
}

interface SelectInputProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    label: string;
    options: SelectOption[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function SelectInput({
    label,
    id,
    options,
    ...props
}: SelectInputProps): JSX.Element {
    return (
        <section className="listing-form__input-group">
            <label>
                <div className="form-group-title">
                    <span>{label}</span>
                </div>
                <select id={id} {...props}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
        </section>
    );
}

export { TextInput, TextArea, SelectInput };
