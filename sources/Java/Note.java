package memorize;


public class Note {
    private int id;
    private String title;
    private String text;
    private int progress;
    private String align;

    public Note(int id, String title, String text, int progress, String align)
    {
        this.id = id;
        this.title = title;
        this.text = text;
        this.progress = progress;
        this.align = align;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getText() {
        return text;
    }

    public int getProgress() {
        return progress;
    }

    public String getAlign() {
        return align;
    }
}
