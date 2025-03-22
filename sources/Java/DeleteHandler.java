package memorize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


@WebServlet(name = "DeleteHandler", urlPatterns = "/u/delete/")
public class DeleteHandler extends ActionHandler{

    @Override
    public void init() throws ServletException {
        super.init();
        errorMessage = "Internal error";
        successMessage = "Note was deleted";
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        User user = (User) request.getSession().getAttribute("user");
        String sqlQuery = "DELETE FROM notes" +
                " WHERE user_id=" + user.getId() + " AND id=" + request.getAttribute("id");
        processQuery(sqlQuery,request,response);
    }
}
