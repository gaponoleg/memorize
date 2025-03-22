package memorize;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;


public class NotesDBManager extends DBManager{
    public NotesDBManager(Connection connection) {
        super(connection);
    }

    public List<Note> getAllNotes(User user) {
        try (Statement statement = connection.createStatement()) {
            String sqlQuery = "select * from notes WHERE user_id = '" + user.getId() + "' ORDER BY id DESC";
            ResultSet res = statement.executeQuery(sqlQuery);
            List<Note> notes = new ArrayList<>();
            while (res.next()){
                String align = res.getBoolean("align") ? "center" : "left";
                notes.add(new Note(res.getInt("id"), res.getString("title"),
                        res.getString("text"), res.getInt("progress"), align));
            }
            return notes;
        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
        return null;
    }
}
