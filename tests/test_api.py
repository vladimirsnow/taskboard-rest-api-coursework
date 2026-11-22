# Проверяет REST API по HTTP на отдельной тестовой базе с подготовленными проектами.
"""Запуск: python3 -m unittest discover -s tests -v. Настройки — API_URL, ADMIN_EMAIL и ADMIN_PASSWORD."""

import json
import os
import secrets
import unittest
import uuid
from urllib.error import HTTPError
from urllib.request import Request, urlopen


API_URL = os.environ.get("API_URL", "http://127.0.0.1:4174").rstrip("/")


def request(method, path, body=None, token=None):
    """Возвращает HTTP-статус и разобранный JSON, включая ответы с ошибками."""
    headers = {"Accept": "application/json"}
    payload = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
    if token is not None:
        headers["Authorization"] = f"Bearer {token}"
    query = Request(API_URL + path, data=payload, headers=headers, method=method)
    try:
        response = urlopen(query, timeout=15)
    except HTTPError as error:
        response = error
    with response:
        if response.headers.get_content_type() != "application/json":
            raise AssertionError(f"{method} {path}: сервер вернул ответ вне формата JSON")
        return response.status, json.load(response)


def new_user(name):
    """Готовит уникальные реквизиты для очередного запуска."""
    return {
        "name": name,
        "email": f"course-{uuid.uuid4().hex}@example.test",
        "password": secrets.token_urlsafe(22),
    }


def login(credentials):
    return request("POST", "/api/auth/login", {
        "email": credentials["email"],
        "password": credentials["password"],
    })


class TaskApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.people = []
        for name in ("Участник А", "Участник Б"):
            credentials = new_user(name)
            status, data = request("POST", "/api/auth/register", credentials)
            if status != 201:
                raise AssertionError(f"Подготовка пользователя: ожидался 201, получен {status}")
            status, session = login(credentials)
            if status != 200:
                raise AssertionError(f"Вход тестового пользователя: ожидался 200, получен {status}")
            cls.people.append((data["user"], session["accessToken"], credentials))
        cls.user, cls.token, cls.credentials = cls.people[0]
        cls.peer, cls.peer_token, _ = cls.people[1]
        status, data = request("GET", "/api/projects", token=cls.token)
        if status != 200 or not data.get("projects"):
            raise AssertionError("Перед тестом подготовьте БД и запустите посев проектов.")
        cls.project = data["projects"][0]

    def success(self, method, path, expected, body=None, token=None):
        status, data = request(method, path, body, token)
        self.assertEqual(status, expected, f"{method} {path}")
        return data

    def error(self, method, path, expected, body=None, token=None):
        data = self.success(method, path, expected, body, token)
        self.assertIsInstance(data["error"]["message"], str)
        self.assertTrue(data["error"]["message"].strip())

    def create_task(self):
        body = {
            "title": "Сверить макет",
            "description": "Проверить подписи полей",
            "projectId": self.project["id"],
            "status": "TODO",
        }
        task = self.success("POST", "/api/tasks", 201, body, self.token)["task"]
        path = f"/api/tasks/{task['id']}"
        self.addCleanup(self.remove_if_present, path)
        return task, path

    def remove_if_present(self, path):
        # Сценарий удаления может уже убрать собственную запись.
        status, _ = request("DELETE", path, token=self.token)
        self.assertIn(status, (200, 404), f"Очистка {path}")

    def admin_token(self):
        email = os.environ.get("ADMIN_EMAIL")
        password = os.environ.get("ADMIN_PASSWORD")
        self.assertTrue(email and password, "Для проверки admin задайте ADMIN_EMAIL и ADMIN_PASSWORD.")
        status, data = login({"email": email, "password": password})
        self.assertEqual(status, 200, "Вход подготовленного администратора")
        self.assertEqual(data["user"]["role"], "admin")
        return data["accessToken"]

    def test_register_and_login(self):
        credentials = new_user("Новый исполнитель")
        user = self.success("POST", "/api/auth/register", 201, credentials)["user"]
        self.assertEqual(user["name"], credentials["name"])
        self.assertEqual(user["email"], credentials["email"])
        self.assertEqual(user["role"], "user")
        self.assertIsInstance(user["id"], int)
        self.assertNotIn("passwordHash", user)
        self.assertNotIn("password", user)
        status, session = login(credentials)
        self.assertEqual(status, 200)
        self.assertEqual(session["user"]["id"], user["id"])
        self.assertNotIn("passwordHash", session["user"])
        self.assertIsInstance(session["accessToken"], str)
        self.assertTrue(session["accessToken"])
        self.success("GET", "/api/projects", 200, token=session["accessToken"])

    def test_duplicate_email(self):
        self.error("POST", "/api/auth/register", 409, self.credentials)

    def test_registration_validation(self):
        for fields in ({"email": "example"}, {"name": " "}, {"password": "123"}, {"role": "admin"}):
            with self.subTest(field=next(iter(fields))):
                self.error("POST", "/api/auth/register", 400, new_user("Исполнитель") | fields)

    def test_login_wrong_credentials(self):
        for email in (self.user["email"], f"{uuid.uuid4().hex}@example.test"):
            with self.subTest(registered=email == self.user["email"]):
                self.error("POST", "/api/auth/login", 401, {
                    "email": email, "password": secrets.token_urlsafe(22),
                })

    def test_guest_access(self):
        for path in ("/api/projects", "/api/tasks", "/api/admin/users"):
            with self.subTest(path=path):
                self.error("GET", path, 401)

    def test_projects(self):
        projects = self.success("GET", "/api/projects", 200, token=self.token)["projects"]
        self.assertIn(self.project["id"], [item["id"] for item in projects])
        for item in projects:
            self.assertIsInstance(item["id"], int)
            self.assertTrue(item["name"].strip())

    def test_create_read_update_delete(self):
        task, path = self.create_task()
        self.assertEqual(task["title"], "Сверить макет")
        self.assertEqual(task["description"], "Проверить подписи полей")
        self.assertEqual(task["status"], "TODO")
        self.assertEqual(task["projectId"], self.project["id"])
        self.assertEqual(task["ownerId"], self.user["id"])
        self.assertEqual(task["project"]["id"], self.project["id"])
        self.assertEqual(task["project"]["name"], self.project["name"])
        self.assertEqual(task["owner"]["id"], self.user["id"])
        self.assertEqual(task["owner"]["name"], self.user["name"])
        self.assertNotIn("passwordHash", task["owner"])
        tasks = self.success("GET", "/api/tasks", 200, token=self.token)["tasks"]
        self.assertIn(task["id"], [item["id"] for item in tasks])
        found = self.success("GET", path, 200, token=self.token)["task"]
        self.assertEqual(found, task)
        for status in ("DOING", "DONE"):
            updated = self.success("PATCH", path, 200, {"status": status}, self.token)["task"]
            self.assertEqual(updated["status"], status)
            self.assertEqual(updated["description"], task["description"])
        self.assertEqual(self.success("GET", path, 200, token=self.token)["task"]["status"], "DONE")
        deleted = self.success("DELETE", path, 200, token=self.token)
        self.assertIs(deleted["deleted"], True)
        for method, body in (("GET", None), ("PATCH", {"status": "TODO"}), ("DELETE", None)):
            with self.subTest(method=method):
                self.error(method, path, 404, body, self.token)

    def test_task_validation(self):
        valid = {"title": "Заявка", "projectId": self.project["id"]}
        for body in (
            {}, valid | {"title": " "}, valid | {"status": "OTHER"},
            valid | {"projectId": "1"}, valid | {"projectId": 2147483647},
            valid | {"ownerId": self.peer["id"]}, valid | {"userId": self.peer["id"]},
        ):
            with self.subTest(body=body):
                self.error("POST", "/api/tasks", 400, body, self.token)

    def test_patch_validation_preserves_task(self):
        initial, path = self.create_task()
        for body in ({}, {"status": "OTHER"}, {"ownerId": self.peer["id"]}):
            with self.subTest(body=body):
                self.error("PATCH", path, 400, body, self.token)
        current = self.success("GET", path, 200, token=self.token)["task"]
        self.assertEqual(current, initial)

    def test_private_tasks(self):
        initial, path = self.create_task()
        tasks = self.success("GET", "/api/tasks", 200, token=self.peer_token)["tasks"]
        self.assertNotIn(initial["id"], [item["id"] for item in tasks])
        for method, body in (("GET", None), ("PATCH", {"title": "Замена"}), ("DELETE", None)):
            with self.subTest(method=method):
                self.error(method, path, 404, body, self.peer_token)
        self.assertEqual(self.success("GET", path, 200, token=self.token)["task"], initial)

    def test_user_cannot_list_accounts(self):
        self.error("GET", "/api/admin/users", 403, token=self.token)

    def test_admin_lists_accounts(self):
        accounts = self.success("GET", "/api/admin/users", 200, token=self.admin_token())["users"]
        self.assertIn(self.user["id"], [item["id"] for item in accounts])
        for item in accounts:
            self.assertTrue({"id", "name", "email", "role"}.issubset(item))
            self.assertNotIn("passwordHash", item)
            self.assertNotIn("password", item)

    def test_admin_manages_user_task(self):
        task, path = self.create_task()
        admin = self.admin_token()
        tasks = self.success("GET", "/api/tasks", 200, token=admin)["tasks"]
        self.assertIn(task["id"], [item["id"] for item in tasks])
        self.assertEqual(self.success("GET", path, 200, token=admin)["task"]["id"], task["id"])
        updated = self.success("PATCH", path, 200, {"status": "DOING"}, admin)["task"]
        self.assertEqual(updated["ownerId"], self.user["id"])
        self.assertEqual(updated["status"], "DOING")
        self.assertTrue(self.success("DELETE", path, 200, token=admin)["deleted"])
        self.error("GET", path, 404, token=self.token)

    def test_unknown_api_route(self):
        self.error("GET", "/api/no-such-resource", 404, token=self.token)


if __name__ == "__main__":
    unittest.main(verbosity=2)
