package memorize;

import java.sql.*;


public class UsersDBManager extends DBManager{
    public  UsersDBManager(Connection connection)
    {
        super(connection);
    }

    public User getUser(int id) {
        try (Statement statement = connection.createStatement()) {
            String sqlQuery = "select * from users WHERE id = '" + id + "'";
            ResultSet res = statement.executeQuery(sqlQuery);
            if (res.next()){
                return new User(id, res.getString("name"), res.getString("email"), res.getString("password"));
            }
            return null;
        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
        return null;
    }

    public User getUser(String email) {
        try (Statement statement = connection.createStatement()) {
            String sqlQuery = "select * from users WHERE email = '" + email + "'";
            ResultSet res = statement.executeQuery(sqlQuery);
            if (res.next()){
                return new User(res.getInt("id"), res.getString("name"), email, res.getString("password"));
            }
            return null;
        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
        return null;
    }

    public User getUser(String email, String password) {
        try (Statement statement = connection.createStatement()) {
            String sqlQuery = "select * from users WHERE email = '" + email + "' AND password ='" + password + "'";
            ResultSet res = statement.executeQuery(sqlQuery);
            if (res.next()){
                System.out.println("User " + email + " found");
                return new User(res.getInt("id"), res.getString("name"), email, password);
            }
            return null;
        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
        return null;
    }

    public User registerUser(String name, String email, String password) {
        String sqlQuery = "INSERT INTO users (name, email, password)" +
                " VALUES ('" + name + "', '" + email +
                "', '" + password +"');";
        try (PreparedStatement statement = connection.prepareStatement(sqlQuery, Statement.RETURN_GENERATED_KEYS)) {
            int rows = statement.executeUpdate();
            ResultSet res = statement.getGeneratedKeys();
            if (rows == 1 && res.next())
            {
                return new User(res.getInt(1),name,email,password);
            }
            else return null;
        }
        catch (Exception e)
        {
            System.out.println(e);
            return null;
        }
    }

    public boolean deleteUser(int id) {
        String sqlQuery = "DELETE FROM users WHERE id=" + id + "; ";
        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate(sqlQuery);
        }
        catch (Exception e)
        {
            return false;
        }
        sqlQuery = "DELETE FROM notes WHERE  user_id=" + id + ";";
        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate(sqlQuery);
        }
        catch (Exception e)
        {
            return true;
        }
        return true;
    }
}
