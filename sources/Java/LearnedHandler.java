package memorize;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


@WebServlet(name = "LearnedHandler", urlPatterns = "/u/learned/")
public class LearnedHandler extends ActionHandler {

    @Override
    public void init() throws ServletException {
        super.init();
        errorMessage = "Internal error";
        successMessage = "Note was marked as learned";
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        User user = (User) request.getSession().getAttribute("user");
        String sqlQuery = "UPDATE notes SET progress=100" +
                " WHERE user_id=" + user.getId() + " AND id=" + request.getAttribute("id");
        processQuery(sqlQuery,request,response);
    }
}
