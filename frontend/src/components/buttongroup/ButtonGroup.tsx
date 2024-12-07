interface ButtonGroupProps {
    onDraft: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onPublish: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isEdit: boolean;
}

function ButtonGroup({
    onDraft,
    onPublish,
    onDelete,
    isEdit,
}: ButtonGroupProps): JSX.Element {
    return (
        <div className="button-group">
            <button type="button" className="draft-btn" onClick={onDraft}>
                {isEdit ? "Update Draft" : "Save as Draft"}
            </button>
            <button type="button" className="publish-btn" onClick={onPublish}>
                {isEdit ? "Update and Publish" : "Publish"}
            </button>
            {isEdit && onDelete && (
                <button type="button" className="delete-btn" onClick={onDelete}>
                    Delete Listing
                </button>
            )}
        </div>
    );
}

export default ButtonGroup;
